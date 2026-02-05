import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <AppSidebar />
            </div>
            <main className="md:pl-72 h-full pt-safe pb-safe">
                <AppHeader />
                {children}
            </main>
        </div>
    );
}
