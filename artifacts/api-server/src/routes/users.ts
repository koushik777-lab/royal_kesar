import { Router, type IRouter } from "express";
import { User } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/users", requireAdmin, async (_req, res): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        address: u.address,
        role: u.role,
        createdAt: u.createdAt,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const updated = await User.findOneAndUpdate(
      { id: user.id },
      { $set: parsed.data },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      address: updated.address,
      role: updated.role,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
