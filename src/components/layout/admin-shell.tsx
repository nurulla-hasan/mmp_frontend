import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminHeader from "./admin-header";
import AdminSidebar from "./admin-sidebar";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader/>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
