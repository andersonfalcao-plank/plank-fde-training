import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

import { RequestList } from "./_components/request-list";

export const metadata: Metadata = {
  title: "Requests",
};

export default function RequestsPage({ searchParams }: PageProps<"/requests">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Requests</h1>
        <Button asChild>
          <Link href="/requests/new">New request</Link>
        </Button>
      </div>
      <Suspense>
        <RequestList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
