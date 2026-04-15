import { Router, type IRouter } from "express";
import { Order, Product, User, Category } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/store/summary", requireAdmin, async (_req, res): Promise<void> => {
  try {
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$total" } } } }
    ]);
    const totalRevenue = revenueResult[0]?.total ?? 0;

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);
    const userIds = [...new Set(recentOrders.map(o => o.userId))];
    const users = await User.find({ id: { $in: userIds } });
    const userMap = new Map(users.map(u => [u.id, u]));

    const statusGroups = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const ordersByStatus: Record<string, number> = {};
    for (const s of statusGroups) {
      ordersByStatus[s._id] = s.count;
    }

    const recentMapped = recentOrders.map((o) => {
      const u = userMap.get(o.userId);
      return {
        id: o.id,
        userId: o.userId,
        userName: u?.name ?? "",
        userEmail: u?.email ?? "",
        items: o.items,
        total: parseFloat(o.total),
        status: o.status,
        shippingAddress: o.shippingAddress,
        phone: o.phone,
        paymentMethod: o.paymentMethod,
        notes: o.notes,
        createdAt: o.createdAt,
      };
    });

    res.json({
      totalOrders: orderCount,
      totalRevenue: totalRevenue,
      totalProducts: productCount,
      totalUsers: userCount,
      recentOrders: recentMapped,
      ordersByStatus,
      topProducts: [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/store/featured", async (_req, res): Promise<void> => {
  try {
    const products = await Product.find({ featured: true }).limit(6);
    
    // Get category names
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = await Category.find({ id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

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
        categoryName: categoryMap.get(p.categoryId) ?? "",
        stock: p.stock,
        featured: p.featured,
        weight: p.weight,
        origin: p.origin,
        rating: parseFloat(p.rating ?? "0"),
        reviewCount: p.reviewCount,
        createdAt: p.createdAt,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
