import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),

  image: z.string().nullable().optional(),
  email: z.string(),
  emailVerified: z.boolean(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
