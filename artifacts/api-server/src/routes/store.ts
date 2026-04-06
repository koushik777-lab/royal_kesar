import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/store/summary", requireAdmin, async (_req, res): Promise<void> => {
  const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [revenueRow] = await db.select({ total: sql<number>`coalesce(sum(total::numeric), 0)::float` }).from(ordersTable);

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  const users = await db.select().from(usersTable);
  const userMap: Record<number, any> = {};
  for (const u of users) userMap[u.id] = u;

  const statusGroups = await db
    .select({ status: ordersTable.status, count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const ordersByStatus: Record<string, number> = {};
  for (const s of statusGroups) {
    ordersByStatus[s.status] = s.count;
  }

  const recentMapped = recentOrders.map((o) => ({
    id: o.id,
    userId: o.userId,
    userName: userMap[o.userId]?.name ?? "",
    userEmail: userMap[o.userId]?.email ?? "",
    items: o.items,
    total: parseFloat(o.total),
    status: o.status,
    shippingAddress: o.shippingAddress,
    phone: o.phone,
    paymentMethod: o.paymentMethod,
    notes: o.notes,
    createdAt: o.createdAt,
  }));

  res.json({
    totalOrders: orderCount.count,
    totalRevenue: revenueRow.total,
    totalProducts: productCount.count,
    totalUsers: userCount.count,
    recentOrders: recentMapped,
    ordersByStatus,
    topProducts: [],
  });
});

router.get("/store/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      description: productsTable.description,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      imageUrl: productsTable.imageUrl,
      images: productsTable.images,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      stock: productsTable.stock,
      featured: productsTable.featured,
      weight: productsTable.weight,
      origin: productsTable.origin,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.featured, true))
    .limit(6);

  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
      imageUrl: p.imageUrl,
      images: p.images ?? [],
      categoryId: p.categoryId,
      categoryName: p.categoryName ?? "",
      stock: p.stock,
      featured: p.featured,
      weight: p.weight,
      origin: p.origin,
      rating: parseFloat(p.rating ?? "0"),
      reviewCount: p.reviewCount,
      createdAt: p.createdAt,
    }))
  );
});

export default router;
