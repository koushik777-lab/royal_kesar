import { Router, type IRouter } from "express";
import { db, ordersTable, cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams, UpdateOrderStatusBody, UpdateOrderStatusParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

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
    notes: order.notes,
    createdAt: order.createdAt,
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  if (user.role === "admin") {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const users = await db.select().from(usersTable);
    const userMap: Record<number, any> = {};
    for (const u of users) userMap[u.id] = u;

    res.json(orders.map((o) => mapOrder(o, userMap[o.userId])));
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, user.id))
    .orderBy(desc(ordersTable.createdAt));

  res.json(orders.map((o) => mapOrder(o, user)));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cartItems = await db
    .select({
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      productName: productsTable.name,
      imageUrl: productsTable.imageUrl,
      price: productsTable.price,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, user.id));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const items = cartItems.map((item) => ({
    productId: item.productId,
    productName: item.productName ?? "",
    imageUrl: item.imageUrl,
    price: parseFloat(item.price ?? "0"),
    quantity: item.quantity,
    subtotal: parseFloat(item.price ?? "0") * item.quantity,
  }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId: user.id,
      items,
      total: String(total),
      status: "pending",
      shippingAddress: parsed.data.shippingAddress,
      phone: parsed.data.phone,
      paymentMethod: parsed.data.paymentMethod,
      notes: parsed.data.notes,
    })
    .returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, user.id));

  res.status(201).json(mapOrder(order, user));
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (user.role !== "admin" && order.userId !== user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(mapOrder(order, user));
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

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId));

  res.json(mapOrder(order, user));
});

export default router;
