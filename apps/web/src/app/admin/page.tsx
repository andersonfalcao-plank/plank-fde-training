import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";

import { OverviewContent } from "./_components/overview-content";

export const metadata: Metadata = {
  title: "Overview",
};

export default function AdminOverviewPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner className="size-6" aria-label="Loading the requests" />
          </div>
        }
      >
        <OverviewContent />
      </Suspense>
    </main>
  );
}
