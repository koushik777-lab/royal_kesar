import { Router, type IRouter } from "express";
import { Product, Category } from "@workspace/db";
import {
  CreateProductBody,
  ListProductsQueryParams,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

function mapProduct(p: any, catName: string) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    imageUrl: p.imageUrl,
    images: p.images ?? [],
    categoryId: p.categoryId,
    categoryName: catName,
    stock: p.stock,
    featured: p.featured,
    weight: p.weight,
    origin: p.origin,
    rating: parseFloat(p.rating ?? "0"),
    reviewCount: p.reviewCount,
    createdAt: p.createdAt,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { categoryId, featured, search } = query.data;

  const filter: any = {};
  if (categoryId !== undefined) filter.categoryId = categoryId;
  if (featured !== undefined) filter.featured = featured;
  if (search) filter.name = { $regex: search, $options: "i" };

  try {
    const products = await Product.find(filter).sort({ createdAt: 1 });
    
    // Get category names
    const categoryIds = [...new Set(products.map(p => p.categoryId))];
    const categories = await Category.find({ id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    res.json(products.map((p) => mapProduct(p, categoryMap.get(p.categoryId) ?? "")));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = {
    ...parsed.data,
    price: String(parsed.data.price),
    originalPrice: parsed.data.originalPrice != null ? String(parsed.data.originalPrice) : undefined,
    images: parsed.data.images ?? [],
    featured: parsed.data.featured ?? false,
    rating: "0",
    reviewCount: 0,
  };

  try {
    const product = await Product.create(data);
    const cat = await Category.findOne({ id: product.categoryId });

    res.status(201).json(mapProduct(product, cat?.name ?? ""));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const product = await Product.findOne({ id: params.data.id });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const cat = await Category.findOne({ id: product.categoryId });
    res.json(mapProduct(product, cat?.name ?? ""));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data: any = { ...parsed.data };
  if (data.price !== undefined) data.price = String(data.price);
  if (data.originalPrice !== undefined) data.originalPrice = String(data.originalPrice);

  try {
    const product = await Product.findOneAndUpdate(
      { id: params.data.id },
      { $set: data },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const cat = await Category.findOne({ id: product.categoryId });
    res.json(mapProduct(product, cat?.name ?? ""));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    await Product.deleteOne({ id: params.data.id });
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
