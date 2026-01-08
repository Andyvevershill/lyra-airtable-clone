import { DEFAULT_BASE_CONFIG, getRandomColor } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { bases, cells, columns, rows, tables } from "@/server/db/schemas/bases";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export const baseRouter = createTRPCRouter({
  // Create a new base
  createById: protectedProcedure
    .input(z.object({})) // Empty input - no user input needed
    .mutation(async ({ ctx }) => {
      const result = await ctx.db.transaction(async (tx) => {
        // 1. Create the base with defaults
        const [base] = await tx
          .insert(bases)
          .values({
            name: DEFAULT_BASE_CONFIG.name,
            color: getRandomColor(),
            userId: ctx.session.user.id,
          })
          .returning();

        if (!base) throw new Error("Failed to create base");

        // 2. Create the default table
        const [table] = await tx
          .insert(tables)
          .values({
            baseId: base.id,
            name: DEFAULT_BASE_CONFIG.defaultTableName,
          })
          .returning();

        if (!table) throw new Error("Failed to create base");

        // 3. Create the columns
        const createdColumns = await tx
          .insert(columns)
          .values(
            DEFAULT_BASE_CONFIG.columns.map((col) => ({
              tableId: table.id,
              name: col.name,
              type: col.type,
              position: col.position,
            })),
          )
          .returning();

        // 4. Create the rows
        const rowValues = Array.from(
          { length: DEFAULT_BASE_CONFIG.defaultRowCount },
          (_, i) => ({
            tableId: table.id,
            position: i,
          }),
        );

        const createdRows = await tx.insert(rows).values(rowValues).returning();

        // 5. Create the cells (3 rows × 6 columns = 18 cells)
        const cellsToCreate = [];
        for (const row of createdRows) {
          for (const column of createdColumns) {
            cellsToCreate.push({
              rowId: row.id,
              columnId: column.id,
              value: null,
            });
          }
        }

        await tx.insert(cells).values(cellsToCreate);

        return { base, table };
      });

      return result;
    }),

  // List all bases for current user (sorted by most recently accessed)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(bases)
      .where(eq(bases.userId, ctx.session.user.id))
      .orderBy(desc(bases.lastAccessedAt));
  }),

  // Get a single base by ID with just basic info for the base itself e.g. name, color
  getMetaById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.query.bases.findFirst({
        where: and(
          eq(bases.id, input.id),
          eq(bases.userId, ctx.session.user.id),
        ),
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),

  // Get a single base by ID with tables, columns, rows and cells
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.query.bases.findFirst({
        where: and(
          eq(bases.id, input.id),
          eq(bases.userId, ctx.session.user.id),
        ),
        with: {
          tables: {
            with: {
              columns: true,
              rows: {
                with: {
                  cells: true,
                },
              },
            },
          },
        },
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),

  updateNameById: protectedProcedure
    .input(z.object({ baseId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [base] = await ctx.db
        .update(bases)
        .set({ name: input.name })
        .where(eq(bases.id, input.baseId))
        .returning();

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),

  updateFavouriteById: protectedProcedure
    .input(z.object({ baseId: z.string(), favourite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [base] = await ctx.db
        .update(bases)
        .set({ isFavourite: input.favourite })
        .where(eq(bases.id, input.baseId))
        .returning();

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),

  // Update last accessed timestamp
  updateLastAccessed: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [base] = await ctx.db
        .update(bases)
        .set({ lastAccessedAt: new Date() })
        .where(eq(bases.id, input.id))
        .returning();

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),

  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [base] = await ctx.db
        .delete(bases)
        .where(eq(bases.id, input.id))
        .returning();

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),
});
