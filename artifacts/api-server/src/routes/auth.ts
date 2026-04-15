import { Router, type IRouter } from "express";
import { User } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { hashPassword, generateToken, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name } = parsed.data;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({ email, passwordHash, name, role: "customer" });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const passwordHash = hashPassword(password);

  try {
    const user = await User.findOne({ email });

    if (!user || user.passwordHash !== passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.post("/auth/admin/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    res.status(500).json({ error: "Admin credentials not configured" });
    return;
  }

  if (email === adminEmail && password === adminPassword) {
    try {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ 
          email, 
          passwordHash: hashPassword(password), 
          name: "System Administrator", 
          role: "admin" 
        });
      } else {
        let modified = false;
        if (user.role !== "admin") {
          user.role = "admin";
          modified = true;
        }
        const expectedHash = hashPassword(password);
        if (user.passwordHash !== expectedHash) {
          user.passwordHash = expectedHash;
          modified = true;
        }
        if (modified) {
          await user.save();
        }
      }

      const token = generateToken(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
  });
});

export default router;
