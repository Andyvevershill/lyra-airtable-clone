"use client";

import NoBases from "@/components/base/no-bases";
import DashboardContainer from "@/components/dashboard/dashboard-container";
import { api } from "@/trpc/react";
import { GiJumpingRope } from "react-icons/gi";

export default function DashboardPage() {
  const { data: bases, isLoading } = api.base.getAll.useQuery();

  if (isLoading)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <GiJumpingRope size={50} className="animate-bounce" />
      </div>
    );

  if (!bases || bases.length === 0) {
    return (
      <div className="IC flex h-full w-full">
        <NoBases />
      </div>
    );
  }

  return <DashboardContainer bases={bases} />;
}
