import type { BaseWithTables } from "@/types/base";
import BasesGridView from "./bases-grid-view";

interface Props {
  bases: BaseWithTables[];
  viewMode: "grid" | "list";
}

export default function BaseContainer({ bases, viewMode }: Props) {
  return (
    <div className="flex w-full flex-1 flex-row items-start">
      {viewMode === "grid" && <BasesGridView bases={bases} />}
    </div>
  );
}
