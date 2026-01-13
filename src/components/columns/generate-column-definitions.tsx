import { DataTableColumnHeader } from "@/app/base/[id]/[tableId]/data-table-column-header";
import type { ColumnType } from "@/types/column";
import type { RowWithCells, TransformedRow } from "@/types/row";
import type { ColumnDef } from "@tanstack/react-table";
import EditableCell from "../table/editable-cell";

export function generateColumnDefinitions(
  dbColumns: ColumnType[],
  onCellEdit: (cellId: string, columnId: string, value: string | null) => void,
): ColumnDef<TransformedRow>[] {
  return dbColumns.map((col) => ({
    id: col.id,
    accessorFn: (row) => row._cells[col.id],

    meta: {
      label: col.name,
      dataType: col.type,
    },

    enableSorting: true,
    enableColumnFilter: true,
    enableHiding: true,

    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={col.name}
        dataType={col.type}
      />
    ),

    cell: (props) => (
      <EditableCell
        {...props}
        columnId={col.id}
        onCellUpdate={onCellEdit}
        dataType={col.type}
      />
    ),
  }));
}

export function transformRowsToTanStackFormat(
  rows: RowWithCells[],
): TransformedRow[] {
  return rows.map((row) => {
    const transformedRow: TransformedRow = {
      _rowId: row.id,
      _position: row.position,
      _cells: {},
      _cellMap: {},
    };

    row.cells.forEach((cell) => {
      transformedRow._cells[cell.columnId] = cell.value;
      transformedRow._cellMap[cell.columnId] = cell.id;
    });

    return transformedRow;
  });
}
