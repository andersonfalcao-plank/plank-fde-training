import type { Metadata } from "next";

import { CreateRequestForm } from "@/features/requests";

export const metadata: Metadata = {
  title: "New request",
};

export default function NewRequestPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">New request</h1>
      <CreateRequestForm />
    </main>
  );
}
