import type { TransformedRow } from "@/types/row";
import type { CellContext } from "@tanstack/react-table";
import { memo, useEffect, useRef, useState } from "react";

interface Props extends CellContext<TransformedRow, unknown> {
  columnId: string;
  onCellUpdate: (rowId: string, columnId: string, value: string | null) => void;
  dataType: string;
}

function EditableCell({
  getValue,
  row,
  columnId,
  onCellUpdate,
  dataType,
}: Props) {
  const cellId = row.original._cellMap[columnId];

  const initialValueRef = useRef<string | null>(
    (getValue() as string | null) ?? "",
  );

  const [value, setValue] = useState<string | null>(initialValueRef.current);
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external updates (sorting, refetch, visibility changes)
  useEffect(() => {
    if (!isEditing) {
      const next = (getValue() as string | null) ?? "";
      initialValueRef.current = next;
      setValue(next);
    }
  }, [getValue, isEditing]);

  const commit = () => {
    if (!isEditing) return;

    const trimmed = value?.trim() || null;

    if (trimmed !== initialValueRef.current && cellId) {
      onCellUpdate(row.original._rowId, columnId, trimmed);
      initialValueRef.current = trimmed;
    }

    setIsEditing(false);
  };

  const cancel = () => {
    setValue(initialValueRef.current);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!cellId) return null;

  return (
    <div
      tabIndex={0}
      className="h-full w-full outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type={dataType}
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className="h-full w-full border-2 border-blue-500 bg-white px-3 text-[13px] outline-none"
        />
      ) : (
        <div className="flex h-full w-full items-center px-3 text-[13px]">
          {value ?? ""}
        </div>
      )}
    </div>
  );
}

export default memo(
  EditableCell,
  (prev, next) =>
    prev.row.original._rowId === next.row.original._rowId &&
    prev.columnId === next.columnId &&
    Object.is(prev.getValue(), next.getValue()) &&
    prev.dataType === next.dataType,
);
