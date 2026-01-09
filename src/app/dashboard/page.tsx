"use client";

import NoBases from "@/components/base/no-bases";
import DashboardContainer from "@/components/dashboard/dashboard-container";
import { api } from "@/trpc/react";

export default function DashboardPage() {
  // Fetch bases (will use cached data if prefetched from sidebar)
  const { data: bases, isLoading } = api.base.getAll.useQuery();

  if (isLoading) return null;

  if (!bases || bases.length === 0) {
    return (
      <div className="IC flex h-full w-full">
        <NoBases />
      </div>
    );
  }

  return <DashboardContainer bases={bases} />;
}
