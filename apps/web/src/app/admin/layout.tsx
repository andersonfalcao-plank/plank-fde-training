import { AdminSidebar } from "./_components/admin-sidebar";

// The layout of all /admin pages: the sidebar and the page content.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-8">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
