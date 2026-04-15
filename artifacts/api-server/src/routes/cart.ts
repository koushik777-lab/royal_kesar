import { Router, type IRouter } from "express";
import { CartItem, Product } from "@workspace/db";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveFromCartParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

async function buildCart(userId: number) {
  // Clean up any potential NaN products using raw collection
  await CartItem.collection.deleteMany({ userId, productId: NaN });

  const items = await CartItem.find({ userId });
  const productIds = items.map(i => i.productId).filter(id => !isNaN(id) && id !== null);
  const products = await Product.find({ id: { $in: productIds } });
  const productMap = new Map(products.map(p => [p.id, p]));

  const cartItems = items.map((item) => {
    const product = productMap.get(item.productId);
    const price = parseFloat(product?.price ?? "0");
    return {
      productId: item.productId,
      productName: product?.name ?? "",
      productSlug: product?.slug ?? "",
      imageUrl: product?.imageUrl,
      price,
      quantity: item.quantity,
      subtotal: price * item.quantity,
    };
  });

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return { items: cartItems, total, itemCount };
}

router.get("/cart", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  try {
    const cart = await buildCart(user.id);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/cart", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity } = parsed.data;

  try {
    const existing = await CartItem.findOne({ userId: user.id, productId });

    if (existing) {
      await CartItem.updateOne(
        { id: existing.id },
        { $set: { quantity: existing.quantity + quantity } }
      );
    } else {
      await CartItem.create({ userId: user.id, productId, quantity });
    }

    const cart = await buildCart(user.id);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/cart/:productId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(rawId as string, 10);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { quantity } = parsed.data;

  try {
    if (quantity <= 0) {
      await CartItem.deleteOne({ userId: user.id, productId });
    } else {
      await CartItem.updateOne(
        { userId: user.id, productId },
        { $set: { quantity } }
      );
    }

    const cart = await buildCart(user.id);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/cart/:productId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(rawId as string, 10);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    await CartItem.deleteOne({ userId: user.id, productId });

    const cart = await buildCart(user.id);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/cart", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  try {
    await CartItem.deleteMany({ userId: user.id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
