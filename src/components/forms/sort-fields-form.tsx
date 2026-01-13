import type { TransformedRow } from "@/types";
import type { Column } from "@tanstack/react-table";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Toggle from "../ui/toggle";

interface Props {
  columns: Column<TransformedRow, unknown>[] | null;
  selectedField: Column<TransformedRow, unknown> | null;
  onClose: () => void;
}

type SortOption = {
  value: "asc" | "desc";
  label: string;
};

export default function SortFieldsForm({
  columns,
  selectedField,
  onClose,
}: Props) {
  const [selectedColumnId, setSelectedColumnId] = useState<string>(
    selectedField?.id ?? "",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortOptions, setSortOptions] = useState<SortOption[]>([
    { value: "asc", label: "A → Z" },
    { value: "desc", label: "Z → A" },
  ]);

  if (!selectedField || !columns) return null;

  useEffect(() => {
    const currentColumn = columns.find((col) => col.id === selectedColumnId);
    if (!currentColumn) return;

    const dataType = currentColumn.columnDef.meta?.dataType ?? "string";

    if (dataType === "number") {
      setSortOptions([
        { value: "asc", label: "1 → 9" },
        { value: "desc", label: "9 → 1" },
      ]);
    } else {
      setSortOptions([
        { value: "asc", label: "A → Z" },
        { value: "desc", label: "Z → A" },
      ]);
    }
  }, [selectedColumnId, columns]);

  const handleApplySort = () => {
    const columnToSort = columns.find((col) => col.id === selectedColumnId);

    if (columnToSort) {
      columnToSort.toggleSorting(sortDirection === "desc");
    }

    onClose();
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="h-80% flex h-full w-full flex-col gap-2 px-4 py-3">
        <div className="flex flex-row items-center gap-1 text-gray-500">
          <p className="text-[13px] font-normal">Sort by</p>
          <HelpCircle size={16} className="pointer text-gray-500" />
        </div>

        <DropdownMenuSeparator />

        <div className="my-1 flex flex-row gap-3">
          {/* Field Selector */}
          <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
            <SelectTrigger className="h-6 w-[240px] rounded-xs">
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent align="end" position="popper" className="rounded-xs">
              {columns.map((column) => {
                const label = column.columnDef.meta?.label ?? column.id;
                return (
                  <SelectItem key={column.id} value={column.id}>
                    {label ?? "Untitled field"}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Sort Direction Selector */}
          <Select
            value={sortDirection}
            onValueChange={(val) => setSortDirection(val as "asc" | "desc")}
          >
            <SelectTrigger className="h-6 w-[120px] rounded-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="w-[120px] rounded-xs"
              align="end"
              position="popper"
            >
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="-row flex h-full w-full justify-between border-t border-gray-200 bg-gray-100 p-2">
        <div className="ml-1 flex items-center justify-start gap-2">
          <Toggle checked={false} onChange={(value) => console.log(value)} />
          <p className="text-[13px]">Automatically sort records</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="pointer h-7 rounded-xs px-3 text-[13px] text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleApplySort}
            className="pointer h-7 rounded-sm bg-[#166ee1] px-3 text-[13px] text-white"
          >
            Sort
          </button>
        </div>
      </div>
    </div>
  );
}
