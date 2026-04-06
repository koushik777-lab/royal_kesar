import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveFromCartParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

async function buildCart(userId: number) {
  const items = await db
    .select({
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      productName: productsTable.name,
      productSlug: productsTable.slug,
      imageUrl: productsTable.imageUrl,
      price: productsTable.price,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map((item) => ({
    productId: item.productId,
    productName: item.productName ?? "",
    productSlug: item.productSlug ?? "",
    imageUrl: item.imageUrl,
    price: parseFloat(item.price ?? "0"),
    quantity: item.quantity,
    subtotal: parseFloat(item.price ?? "0") * item.quantity,
  }));

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return { items: cartItems, total, itemCount };
}

router.get("/cart", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const cart = await buildCart(user.id);
  res.json(cart);
});

router.post("/cart", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity } = parsed.data;

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, user.id), eq(cartItemsTable.productId, productId)));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId: user.id, productId, quantity });
  }

  const cart = await buildCart(user.id);
  res.json(cart);
});

router.put("/cart/:productId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(rawId, 10);

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { quantity } = parsed.data;

  if (quantity <= 0) {
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.userId, user.id), eq(cartItemsTable.productId, productId)));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.userId, user.id), eq(cartItemsTable.productId, productId)));
  }

  const cart = await buildCart(user.id);
  res.json(cart);
});

router.delete("/cart/:productId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(rawId, 10);

  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, user.id), eq(cartItemsTable.productId, productId)));

  const cart = await buildCart(user.id);
  res.json(cart);
});

router.delete("/cart", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, user.id));
  res.json({ success: true });
});

export default router;
