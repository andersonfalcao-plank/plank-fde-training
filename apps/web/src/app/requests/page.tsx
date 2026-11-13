import type { Metadata } from "next";
import { Suspense } from "react";

import { RequestsContent } from "./_components/requests-content";

export const metadata: Metadata = {
  title: "Requests",
};

export default function RequestsPage({ searchParams }: PageProps<"/requests">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Suspense>
        <RequestsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
