import { Router, type IRouter } from "express";
import { Order, CartItem, Product, User } from "@workspace/db";
import { CreateOrderBody, GetOrderParams, UpdateOrderStatusBody, UpdateOrderStatusParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";
import { razorpay } from "../lib/razorpay";
import crypto from "node:crypto";

const router: IRouter = Router();

function mapOrder(order: any, user: any) {
  return {
    id: order.id,
    userId: order.userId,
    userName: user?.name ?? "",
    userEmail: user?.email ?? "",
    items: order.items,
    total: parseFloat(order.total),
    status: order.status,
    shippingAddress: order.shippingAddress,
    phone: order.phone,
    paymentMethod: order.paymentMethod,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    razorpaySignature: order.razorpaySignature,
    notes: order.notes,
    createdAt: order.createdAt,
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  try {
    if (user.role === "admin") {
      const orders = await Order.find().sort({ createdAt: -1 });
      const userIds = [...new Set(orders.map(o => o.userId))];
      const users = await User.find({ id: { $in: userIds } });
      const userMap = new Map(users.map(u => [u.id, u]));

      res.json(orders.map((o) => mapOrder(o, userMap.get(o.userId))));
      return;
    }

    const orders = await Order.find({ userId: user.id }).sort({ createdAt: -1 });
    res.json(orders.map((o) => mapOrder(o, user)));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Razorpay Order
router.post("/orders/razorpay", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  try {
    // Clean up any potential NaN products using raw collection to bypass Mongoose casting
    await CartItem.collection.deleteMany({ userId: user.id, productId: NaN });

    const userCartItems = await CartItem.find({ userId: user.id });
    if (userCartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const productIds = userCartItems.map(item => item.productId).filter(id => !isNaN(id) && id !== null);
    const products = await Product.find({ id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p.id, p]));

    const subtotal = userCartItems.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      const price = parseFloat(product?.price ?? "0");
      return sum + (price * item.quantity);
    }, 0);

    const shipping = 100;
    const gst = subtotal * 0.18;
    const finalTotal = subtotal + shipping + gst;

    const options = {
      amount: Math.round(finalTotal * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    // 1. Verify Payment if online
    if (parsed.data.paymentMethod === "online") {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;
      
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        res.status(400).json({ error: "Payment details missing" });
        return;
      }

      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        res.status(400).json({ error: "Invalid payment signature" });
        return;
      }
    }

    // Clean up any potential NaN products using raw collection
    await CartItem.collection.deleteMany({ userId: user.id, productId: NaN });

    const userCartItems = await CartItem.find({ userId: user.id });

    if (userCartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const productIds = userCartItems.map(item => item.productId).filter(id => !isNaN(id) && id !== null);
    const products = await Product.find({ id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p.id, p]));

    const items = userCartItems.map((item) => {
      const product = productMap.get(item.productId);
      const price = parseFloat(product?.price ?? "0");
      return {
        productId: item.productId,
        productName: product?.name ?? "",
        imageUrl: product?.imageUrl,
        price,
        quantity: item.quantity,
        subtotal: price * item.quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = 100;
    const gst = subtotal * 0.18;
    const finalTotal = subtotal + shipping + gst;

    const order = await Order.create({
      userId: user.id,
      items,
      total: String(finalTotal),
      status: parsed.data.paymentMethod === "online" ? "confirmed" : "pending",
      shippingAddress: parsed.data.shippingAddress,
      phone: parsed.data.phone,
      paymentMethod: parsed.data.paymentMethod,
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
      notes: parsed.data.notes,
    });

    await CartItem.deleteMany({ userId: user.id });

    res.status(201).json(mapOrder(order, user));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const order = await Order.findOne({ id: params.data.id });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (user.role !== "admin" && order.userId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const orderUser = user.id === order.userId ? user : await User.findOne({ id: order.userId });
    res.json(mapOrder(order, orderUser));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const order = await Order.findOneAndUpdate(
      { id: params.data.id },
      { $set: { status: parsed.data.status } },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const orderUser = await User.findOne({ id: order.userId });

    res.json(mapOrder(order, orderUser));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
