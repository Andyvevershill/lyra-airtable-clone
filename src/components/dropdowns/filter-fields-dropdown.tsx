"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import type { TransformedRow } from "@/types";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import type { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { IoFilterOutline } from "react-icons/io5";
import FilterFieldsForm from "../forms/filter-fields-form";

interface DataTableViewOptionsProps<TData> {
  columns: Column<TransformedRow, unknown>[];
}

export default function FilterFieldsDropdown<TData>({
  columns,
}: DataTableViewOptionsProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Column<
    TransformedRow,
    unknown
  > | null>(null);

  const currentlyFilteredColumns = columns.filter((col) => col.getIsFiltered());

  const filteredColumnsNameArr = currentlyFilteredColumns.map(
    (col) => col.columnDef.meta?.label ?? "Untitled ",
  );

  useEffect(() => {
    if (currentlyFilteredColumns.length > 0 && !selectedField) {
      setSelectedField(currentlyFilteredColumns[0] ?? null);
    }
  }, [currentlyFilteredColumns, selectedField]);

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`pointer flex h-7 flex-row items-center gap-1 rounded-xs border border-transparent p-2 text-[13px] ${
            currentlyFilteredColumns.length > 0
              ? "bg-[#cff5d1] text-gray-900 hover:border-2 hover:border-[#a5d6a7]"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <IoFilterOutline />
          {currentlyFilteredColumns.length === 0 ? (
            <span className="text-[13px]">Filter</span>
          ) : (
            <span className="text-[13px]">
              Filtered by {filteredColumnsNameArr}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[590px] rounded-xs">
        <FilterFieldsForm columns={columns} onClose={handleClose} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
