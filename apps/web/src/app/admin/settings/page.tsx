import type { Metadata } from "next";
import { Suspense } from "react";

import { DeploymentCard } from "./_components/deployment-card";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <Suspense>
        <DeploymentCard />
      </Suspense>
    </main>
  );
}
