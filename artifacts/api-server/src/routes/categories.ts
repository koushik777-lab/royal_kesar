import { Router, type IRouter } from "express";
import { Category, Product } from "@workspace/db";
import { CreateCategoryBody, UpdateCategoryBody, UpdateCategoryParams, DeleteCategoryParams } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  try {
    const categories = await Category.find().sort({ id: 1 });

    const counts = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);

    const countMap: Record<number, number> = {};
    for (const c of counts) {
      countMap[c._id] = c.count;
    }

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      productCount: countMap[c.id] ?? 0,
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const cat = await Category.create(parsed.data);

    res.status(201).json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      productCount: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const cat = await Category.findOneAndUpdate(
      { id: params.data.id },
      { $set: parsed.data },
      { new: true }
    );

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const count = await Product.countDocuments({ categoryId: cat.id });

    res.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      productCount: count,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    await Category.deleteOne({ id: params.data.id });
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
