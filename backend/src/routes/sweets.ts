import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Create
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, category, price, quantity } = req.body;
  if (!name || !category || price == null || quantity == null) return res.status(400).json({ error: 'Missing fields' });
  try {
    const sweet = await prisma.sweet.create({ data: { name, category, price: Number(price), quantity: Number(quantity) } });
    res.status(201).json(sweet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List
router.get('/', authenticate, async (req, res) => {
  try {
    const sweets = await prisma.sweet.findMany();
    res.json(sweets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search
router.get('/search', authenticate, async (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query as any;
  const where: any = {};
  if (q) where.name = { contains: q as string, mode: 'insensitive' };
  if (category) where.category = category;
  if (minPrice || maxPrice) where.price = {};
  if (minPrice) where.price.gte = Number(minPrice);
  if (maxPrice) where.price.lte = Number(maxPrice);
  try {
    const sweets = await prisma.sweet.findMany({ where });
    res.json(sweets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const data: any = {};
  ['name', 'category', 'price', 'quantity'].forEach((f) => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
  try {
    const sweet = await prisma.sweet.update({ where: { id }, data });
    res.json(sweet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.sweet.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Purchase
router.post('/:id/purchase', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const qty = Number(req.body.quantity || 1);
  if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'Invalid quantity' });
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const sweet = await tx.sweet.findUnique({ where: { id } });
      if (!sweet) throw new Error('Not found');
      if (sweet.quantity < qty) throw new Error('Insufficient stock');
      return tx.sweet.update({ where: { id }, data: { quantity: sweet.quantity - qty } });
    });
    res.json(updated);
  } catch (err: any) {
    console.error(err);
    if (err.message === 'Not found') return res.status(404).json({ error: 'Sweet not found' });
    if (err.message === 'Insufficient stock') return res.status(400).json({ error: 'Insufficient stock' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Restock (admin only)
router.post('/:id/restock', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const qty = Number(req.body.quantity || 0);
  if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'Invalid quantity' });
  try {
    const updated = await prisma.sweet.update({ where: { id }, data: { quantity: { increment: qty } as any } });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
