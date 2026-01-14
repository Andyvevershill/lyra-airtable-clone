"use client";

import { useLoadingStore } from "@/app/stores/use-loading-store";
import NoDataPage from "@/components/no-data-page";
import { api } from "@/trpc/react";
import type { SortingState } from "@/types/view";
import { keepPreviousData } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TableContainer from "./table-container";

export default function TablePage() {
  const { tableId } = useParams<{ tableId: string }>();
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const [sorting, setSorting] = useState<SortingState>(null);

  const { data: tableWithViews, isLoading: tableWithViewsLoading } =
    api.table.getTableWithViews.useQuery({ tableId });

  const { data: columns, isLoading: columnsLoading } =
    api.column.getColumns.useQuery({ tableId });

  const { data: rowCount, isLoading: countLoading } =
    api.row.getRowCount.useQuery({ tableId });

  const {
    data: rowsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: rowsLoading,
  } = api.row.getRowsInfinite.useInfiniteQuery(
    {
      tableId,
      limit: 5000,
      sorting: sorting ? [sorting] : [],
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData,
    },
  );

  const rowsWithCells = useMemo(
    () => rowsData?.pages?.flatMap((page) => page.items) ?? [],
    [rowsData],
  );

  const isLoading =
    tableWithViewsLoading ||
    columnsLoading ||
    countLoading ||
    rowsLoading ||
    rowCount === 0;

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  if (isLoading) return null;

  if (!tableWithViews || !columns || !rowsWithCells) {
    return <NoDataPage missingData="table data" />;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <TableContainer
        tableId={tableWithViews.id}
        columns={columns}
        rowCount={rowCount ?? 0}
        rowsWithCells={rowsWithCells}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}
