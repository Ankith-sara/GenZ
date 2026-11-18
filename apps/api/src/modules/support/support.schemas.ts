import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  reason: z.enum([
    "General",
    "Seller partnership",
    "Investor / Incubator",
    "Press",
  ]),
  message: z.string().min(5).max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const waitlistSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.string().min(2).max(50),
  city: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

export const analyticsTrackSchema = z.object({
  path: z.string().min(1),
  referrer: z.string().optional(),
  user_agent: z.string().optional(),
});

