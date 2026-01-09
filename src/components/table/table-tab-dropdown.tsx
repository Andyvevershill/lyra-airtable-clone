"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import type { BaseWithTables } from "@/types/base";
import { Check } from "lucide-react";
import { useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { RiArrowDownSLine } from "react-icons/ri";
import { Input } from "../ui/input";
import { AddTableSubmenu } from "./add-table-submenu";

interface Props {
  base: BaseWithTables;
  activeTab: string;
  setTables: React.Dispatch<
    React.SetStateAction<{ id: string; name: string }[]>
  >;
}

export function TableTabDropdown({ base, activeTab, setTables }: Props) {
  const [searchWord, setSearchWord] = useState("");

  function handleSearch() {
    console.log(searchWord);
    setSearchWord("");
  }

  return (
    <div className="flex flex-row gap-1">
      <div className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
        <Menubar className="h-8 w-8 border-0 bg-transparent p-0">
          <MenubarMenu>
            <MenubarTrigger className="pointer-IC h-8 w-8 p-0">
              <RiArrowDownSLine
                size={16}
                className="text-gray-600 hover:text-gray-900"
              />
            </MenubarTrigger>
            <MenubarContent
              className="rounded-xs p-4 text-sm md:w-100"
              align="start"
            >
              {/* Search */}
              <div
                className="flex w-full flex-row items-center gap-2 px-2 py-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <HiMagnifyingGlass size={16} className="text-gray-600" />
                <Input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                    e.stopPropagation();
                  }}
                  placeholder="Find a table"
                  className="h-6 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <MenubarSeparator className="my-2 w-full" />

              {/* Table list */}
              {base.tables.map((table) => (
                <MenubarItem
                  key={table.id}
                  className="flex cursor-pointer flex-row items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-gray-100"
                  onClick={() => console.log("switch to", table.id)}
                >
                  <div className="w-4">
                    {activeTab === table.id && <Check size={16} />}
                  </div>
                  <p className="text-sm">{table.name}</p>
                </MenubarItem>
              ))}

              <MenubarSeparator className="my-2 w-full" />

              {/* Nested submenu for adding table */}
              <AddTableSubmenu
                baseId={base.id}
                tableNumber={base.tables.length + 1}
                setTables={setTables}
              />
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}
