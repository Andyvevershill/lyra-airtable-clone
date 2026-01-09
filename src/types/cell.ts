import z from "zod";

const cellSchema = z.object({
  id: z.string(),
  rowId: z.string(),
  columnId: z.string(),

  value: z.string().nullable(),

  updatedAt: z.date().nullable(),
});

export type Cell = z.infer<typeof cellSchema>;
