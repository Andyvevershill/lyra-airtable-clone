DROP INDEX "cell_sort_text_idx";--> statement-breakpoint
DROP INDEX "cell_sort_number_idx";--> statement-breakpoint
DROP INDEX "cell_value_trgm_idx";--> statement-breakpoint
CREATE INDEX "cell_row_column_value_idx" ON "cell" USING btree ("row_id","column_id","value");--> statement-breakpoint
CREATE INDEX "cell_value_lower_idx" ON "cell" USING btree (LOWER("value"));