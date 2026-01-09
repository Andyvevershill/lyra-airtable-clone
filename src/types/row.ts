import z from "zod";

const rowSchema = z.object({
  id: z.string(),
  tableId: z.string(),

  position: z.number(),

  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type Row = z.infer<typeof rowSchema>;
