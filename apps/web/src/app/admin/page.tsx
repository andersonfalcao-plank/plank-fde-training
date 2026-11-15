import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

// The Admin Overview page. AND-34 adds its content.
export default function AdminOverviewPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
    </main>
  );
}
