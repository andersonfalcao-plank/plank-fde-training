import { SiteNav } from "@/components/site-nav";
import { SiteTitle } from "@/components/site-title";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <SiteTitle />
        <SiteNav />
      </div>
    </header>
  );
}
