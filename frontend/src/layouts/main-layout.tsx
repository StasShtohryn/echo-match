import { Outlet, useLocation } from "react-router";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isMessengerPage = pathname === "/messenger" || pathname.startsWith("/messenger/");
  const isTestPage = pathname.includes("/test") || pathname.includes("/onboarding") || pathname.includes("/register");

  const isFixedLayout = isMessengerPage || isTestPage;
  return (
    <div className={`flex w-full flex-col ${isFixedLayout ? "h-dvh overflow-hidden" : "min-h-dvh"}`}>
      <Header />
      <main className={`flex flex-1 flex-col ${isFixedLayout ? "min-h-0 overflow-hidden" : ""}`}>
        <Outlet />
      </main>
      {!isFixedLayout && (
        <Footer />
      )}
    </div>
  );
}