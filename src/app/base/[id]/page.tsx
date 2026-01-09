"use client";

import NoDataPage from "@/components/no-data-page";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BaseByIdPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: base, isLoading } = api.base.getById.useQuery({ id });

  useEffect(() => {
    if (!base) return;

    const firstTableId = base.tables?.[0]?.id;
    if (firstTableId) {
      router.replace(`/base/${id}/${firstTableId}`);
    }
  }, [base, id, router]);

  if (isLoading) return null;

  if (!base?.tables?.length) {
    return <NoDataPage missingData="tables" />;
  }

  return null;
}
