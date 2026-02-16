"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import type { TransformedRow } from "@/types";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import type { Table } from "@tanstack/react-table";
import { useState } from "react";
import FilterButton from "../buttons/filter-button";
import FilterFieldsForm from "../forms/filter-fields-form";

interface DataTableViewOptionsProps<TData> {
  table: Table<TransformedRow>;
}

export default function FilterFieldsDropdown<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);

  const columns = table.getAllColumns();

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <FilterButton columns={columns} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[590px] rounded-xs">
        <FilterFieldsForm
          columns={columns}
          currentFilters={table.getState().columnFilters}
          onApply={(filters) => {
            table.setColumnFilters(filters);
          }}
          onClose={handleClose}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
