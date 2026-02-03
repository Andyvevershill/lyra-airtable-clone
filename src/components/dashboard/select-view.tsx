"use client";

import { LuGrid2X2 } from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface viewMode {
  viewMode: "grid" | "list";
  setViewMode: (viewMode: "grid" | "list") => void;
}

export default function SelectView({ viewMode, setViewMode }: viewMode) {
  return (
    <div className="flex flex-row gap-1 text-gray-700">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setViewMode("list")}
            className={`pointer IC flex h-7 w-7 rounded-full ${
              viewMode === "list" ? "bg-gray-200" : "bg-transparent"
            }`}
          >
            <RxHamburgerMenu />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">View items in a list</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setViewMode("grid")}
            className={`pointer IC flex h-7 w-7 rounded-full ${
              viewMode === "grid" ? "bg-gray-200" : "bg-transparent"
            }`}
          >
            <LuGrid2X2 />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={5}>
          View items in a grid
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
