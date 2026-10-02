import { Outlet, useLocation } from "react-router";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isMessengerPage = pathname === "/messenger" || pathname.startsWith("/messenger/");

  return (
    <div>
      <ScrollArea className="h-screen w-full overflow-hidden">
        <div className="flex h-screen min-h-svh flex-col overflow-hidden">
          <Header />
          <main className="flex min-h-0 flex-1 flex-col">
            <Outlet />
          </main>
        </div>
        {!isMessengerPage && (
          <div>
            <Footer />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}