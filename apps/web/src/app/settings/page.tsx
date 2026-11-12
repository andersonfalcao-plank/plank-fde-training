import type { Metadata } from "next";
import { Suspense } from "react";

import { DeploymentCard } from "./_components/deployment-card";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <Suspense>
        <DeploymentCard />
      </Suspense>
    </main>
  );
}
