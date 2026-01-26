import { generateBulkFakerData } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { cells, columns, rows } from "@/server/db/schemas/bases";
import { getRowsInfiniteInput, type SearchMatch } from "@/types/view";
import {
  and,
  asc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  not,
  SQL,
  sql,
} from "drizzle-orm";
import { z } from "zod";

export const rowsRouter = createTRPCRouter({
  getRowsInfinite: protectedProcedure
    .input(getRowsInfiniteInput)
    .query(async ({ ctx, input }) => {
      const { tableId, limit, cursor, filters, sorting, globalSearch } = input;
      const offset = cursor ?? 0;

      const hasFilters = filters.length > 0;
      const hasSorting = sorting.length > 0;
      const isFirstPage = offset === 0;
      const needsColumns = hasFilters || hasSorting;

      // 1. Fetch column metadata if needed for filters or sorting
      let columnMap: Map<string, { id: string; type: string }> | null = null;
      if (needsColumns) {
        const tableColumns = await ctx.db
          .select({
            id: columns.id,
            type: columns.type,
          })
          .from(columns)
          .where(eq(columns.tableId, tableId));

        columnMap = new Map(tableColumns.map((c) => [c.id, c]));
      }

      // 2. Build WHERE clause with filter conditions
      const rowWhereClauses: SQL[] = [eq(rows.tableId, tableId)];

      if (hasFilters && columnMap) {
        for (const filter of filters) {
          const column = columnMap.get(filter.columnId);
          if (!column) continue;

          let cellCond: SQL;

          switch (filter.operator) {
            case "equals":
              cellCond = sql`LOWER(${cells.value}) = LOWER(${filter.value as string})`;
              break;
            case "contains":
              cellCond = ilike(cells.value, `%${filter.value}%`);
              break;
            case "notContains":
              cellCond = not(ilike(cells.value, `%${filter.value}%`));
              break;
            case "greaterThan":
              cellCond = sql`CAST(${cells.value} AS REAL) > ${parseFloat(filter.value as string)}`;
              break;
            case "lessThan":
              cellCond = sql`CAST(${cells.value} AS REAL) < ${parseFloat(filter.value as string)}`;
              break;
            case "isEmpty":
              cellCond = isNull(cells.value);
              break;
            case "isNotEmpty":
              cellCond = isNotNull(cells.value);
              break;
          }

          if (cellCond) {
            rowWhereClauses.push(
              sql`EXISTS (
              SELECT 1 FROM ${cells}
              WHERE ${cells.rowId} = ${rows.id}
                AND ${cells.columnId} = ${filter.columnId}
                AND ${cellCond}
            )`,
            );
          }
        }
      }

      const finalWhere = and(...rowWhereClauses);

      // 3. Build ORDER BY clause with sorting logic
      const orderByClauses: SQL[] = [];

      if (hasSorting && columnMap) {
        const sort = sorting[0]!;
        const col = columnMap.get(sort.columnId);

        if (col) {
          const sortValue = sql`(
          SELECT ${cells.value}
          FROM ${cells}
          WHERE ${cells.rowId} = ${rows.id}
            AND ${cells.columnId} = ${col.id}
          LIMIT 1
        )`;

          const castValue =
            col.type === "number"
              ? sql`CAST((${sortValue}) AS REAL)`
              : sortValue;

          const orderedExpr =
            sort.direction === "asc"
              ? sql`${castValue} ASC NULLS LAST`
              : sql`${castValue} DESC NULLS LAST`;

          orderByClauses.push(orderedExpr);
        }
      }

      // Always add position for stable sorting
      orderByClauses.push(asc(rows.position));

      // 4. Fetch rows and count in parallel (batched)
      const [pageRows, countResult] = await Promise.all([
        ctx.db
          .select({
            id: rows.id,
            tableId: rows.tableId,
            position: rows.position,
          })
          .from(rows)
          .where(finalWhere)
          .orderBy(...orderByClauses)
          .limit(limit + 1)
          .offset(offset),

        hasFilters && isFirstPage
          ? ctx.db
              .select({ count: sql<number>`count(*)` })
              .from(rows)
              .where(finalWhere)
          : Promise.resolve([{ count: undefined }]),
      ]);

      const hasMore = pageRows.length > limit;
      const visibleRows = hasMore ? pageRows.slice(0, limit) : pageRows;
      const rowIds = visibleRows.map((r) => r.id);

      // 5. Fetch all cells for visible rows
      const cellsData = rowIds.length
        ? await ctx.db.select().from(cells).where(inArray(cells.rowId, rowIds))
        : [];

      // 6. Group cells by row ID
      const cellsByRow = new Map<string, (typeof cellsData)[number][]>();
      for (const cell of cellsData) {
        const list = cellsByRow.get(cell.rowId) ?? [];
        list.push(cell);
        cellsByRow.set(cell.rowId, list);
      }

      // 7. Build final response items
      const items = visibleRows.map((row) => ({
        id: row.id,
        tableId: row.tableId,
        cells: (cellsByRow.get(row.id) ?? []).map((c) => ({
          id: c.id,
          columnId: c.columnId,
          value: c.value,
        })),
      }));

      const totalFilteredCount = countResult[0]?.count;

      // 8. Perform global search if term provided
      const matches: SearchMatch[] = [];

      if (globalSearch?.trim()) {
        const term = globalSearch.trim().toLowerCase();

        const columnHeaders = await ctx.db
          .select({
            id: columns.id,
          })
          .from(columns)
          .where(
            and(eq(columns.tableId, tableId), ilike(columns.name, `%${term}%`)),
          );

        const dataToPush = columnHeaders.map((column) => ({
          type: "column" as const,
          columnId: column.id,
        }));

        matches.push(...dataToPush);

        items.forEach((row, idx) => {
          row.cells.forEach((cell) => {
            if (cell.value && String(cell.value).toLowerCase().includes(term)) {
              matches.push({
                type: "cell",
                cellId: `${row.id}_${cell.columnId}`,
                rowIndex: idx,
              });
            }
          });
        });
      }

      const nextCursor = hasMore ? offset + limit : undefined;

      return {
        items,
        searchMatches: matches,
        totalFilteredCount,
        nextCursor,
      };
    }),

  getRowCount: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(rows)
        .where(eq(rows.tableId, input.tableId));

      return countResult[0]?.count ?? 0;
    }),

  addRow: protectedProcedure
    .input(z.object({ tableId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const tableColumns = await tx.query.columns.findMany({
          where: eq(columns.tableId, input.tableId),
          orderBy: (columns, { asc }) => [asc(columns.position)],
        });

        // Create the row
        const [newRow] = await tx
          .insert(rows)
          .values({
            id: input.id,
            tableId: input.tableId,
          })
          .returning({ id: rows.id });

        if (!newRow) {
          throw new Error("Failed to create row");
        }

        if (tableColumns.length > 0) {
          await tx.insert(cells).values(
            tableColumns.map((column) => ({
              rowId: newRow.id,
              columnId: column.id,
              value: null,
            })),
          );
        }
      });
    }),

  addBulkRows: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        count: z.number().max(100000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      console.log(
        `[addBulkRows] 🚀 Starting bulk insert of ${input.count} rows for table ${input.tableId}`,
      );

      // 1. Fetch columns (once, outside loop) - NOT in a transaction
      const columnsStartTime = Date.now();
      const tableColumns = await ctx.db.query.columns.findMany({
        where: eq(columns.tableId, input.tableId),
        orderBy: (columns, { asc }) => [asc(columns.position)],
        columns: {
          id: true,
          type: true,
        },
      });
      const columnsFetchTime = Date.now() - columnsStartTime;
      console.log(
        `[addBulkRows] ✅ Found ${tableColumns.length} columns (took ${columnsFetchTime}ms)`,
      );

      const totalRows = input.count;
      const rowBatchSize = 9500;
      const rowBatches = Math.ceil(totalRows / rowBatchSize);

      console.log(
        `[addBulkRows] 📊 Processing ${rowBatches} batch(es) of up to ${rowBatchSize} rows`,
      );

      let totalInserted = 0;
      let lastError: Error | null = null;

      // Process each batch in its OWN transaction
      for (let batch = 0; batch < rowBatches; batch++) {
        const batchStartTime = Date.now();
        const batchStart = batch * rowBatchSize;
        const batchEnd = Math.min((batch + 1) * rowBatchSize, totalRows);
        const currentBatchSize = batchEnd - batchStart;

        console.log(
          `[addBulkRows] 📦 Batch ${batch + 1}/${rowBatches}: ${currentBatchSize} rows (${batchStart}-${batchEnd})`,
        );

        try {
          // Each batch gets its own transaction
          await ctx.db.transaction(async (tx) => {
            // Step 1: Prepare and insert rows → get IDs
            const rowsToInsert = Array.from(
              { length: currentBatchSize },
              () => ({
                tableId: input.tableId,
              }),
            );

            const insertedRows = await tx
              .insert(rows)
              .values(rowsToInsert)
              .returning({ id: rows.id });

            console.log(
              `[addBulkRows]   ✅ Inserted ${insertedRows.length} rows (${Date.now() - batchStartTime}ms so far)`,
            );

            // Step 2: Generate faker data per column
            const fakerStartTime = Date.now();
            const fakerDataByColumn = new Map<string, string[]>();

            for (const column of tableColumns) {
              fakerDataByColumn.set(
                column.id,
                generateBulkFakerData(column.type, currentBatchSize),
              );
            }
            console.log(
              `[addBulkRows]   ✅ Generated faker data (${Date.now() - fakerStartTime}ms)`,
            );

            // Step 3: Generate & insert cells incrementally + batch them
            const cellFlushSize = 12500;
            let cellBuffer = [];
            const cellInsertQueries = [];

            for (let rowIdx = 0; rowIdx < insertedRows.length; rowIdx++) {
              const row = insertedRows[rowIdx];

              for (const column of tableColumns) {
                if (!row) continue;

                cellBuffer.push({
                  rowId: row.id,
                  columnId: column.id,
                  value: fakerDataByColumn.get(column.id)![rowIdx],
                  updatedAt: null,
                });

                // Flush when buffer is full
                if (cellBuffer.length >= cellFlushSize) {
                  cellInsertQueries.push(tx.insert(cells).values(cellBuffer));
                  cellBuffer = [];
                }
              }
            }

            // Final flush
            if (cellBuffer.length > 0) {
              cellInsertQueries.push(tx.insert(cells).values(cellBuffer));
            }

            // Execute all collected cell inserts in parallel
            if (cellInsertQueries.length > 0) {
              const batchStart = Date.now();
              await Promise.all(cellInsertQueries);
              const batchTime = Date.now() - batchStart;
              console.log(
                `[addBulkRows]   ✅ Executed ${cellInsertQueries.length} cell batches via Promise.all() (${batchTime}ms, ~${Math.round(
                  (currentBatchSize * tableColumns.length) / (batchTime / 1000),
                )} cells/sec)`,
              );
            }
          });

          // If we get here, the transaction committed successfully
          totalInserted += currentBatchSize;

          const batchTotalTime = Date.now() - batchStartTime;
          console.log(
            `[addBulkRows] ✅ Batch ${batch + 1}/${rowBatches} complete (${batchTotalTime}ms) — Progress: ${totalInserted}/${totalRows} (${Math.round(
              (totalInserted / totalRows) * 100,
            )}%)`,
          );
        } catch (error) {
          console.error(
            `[addBulkRows] ❌ Batch ${batch + 1}/${rowBatches} failed:`,
            error,
          );
          lastError = error as Error;
          // Stop processing further batches
          break;
        }
      }

      const totalTime = Date.now() - startTime;
      const rowsPerSec =
        totalInserted > 0 ? Math.round(totalInserted / (totalTime / 1000)) : 0;

      console.log(
        `\n[addBulkRows] ${lastError ? "⚠️ PARTIAL COMPLETE" : "🎉 COMPLETE!"}`,
      );
      console.log(
        `[addBulkRows]   Total rows inserted: ${totalInserted}/${totalRows}`,
      );
      console.log(
        `[addBulkRows]   Total time: ${(totalTime / 1000).toFixed(2)}s`,
      );
      if (rowsPerSec > 0) {
        console.log(`[addBulkRows]   Average speed: ~${rowsPerSec} rows/sec`);
      }

      if (lastError) {
        console.log(`[addBulkRows]   Error: ${lastError.message}`);
      }

      return {
        inserted: totalInserted,
        requested: totalRows,
        failed: lastError !== null,
        error: lastError?.message,
      };
    }),
});
