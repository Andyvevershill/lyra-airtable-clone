import type { BaseWithTables } from "@/types/base";
import BaseCard from "./base-card";

interface Props {
  bases: BaseWithTables[];
}

export default function BasesGridView({ bases }: Props) {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {bases.map((base) => (
        <BaseCard key={base.id} base={base} />
      ))}
    </div>
  );
}
