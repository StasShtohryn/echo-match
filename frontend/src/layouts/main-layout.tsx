import { Outlet, useLocation } from "react-router";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isMessengerPage = pathname === "/messenger" || pathname.startsWith("/messenger/");

  return (
    <div className={`flex w-full flex-col ${isMessengerPage ? "h-dvh overflow-hidden" : "min-h-dvh"}`}>
      <Header />
      <main className={`flex flex-1 flex-col ${isMessengerPage ? "min-h-0" : ""}`}>
        <Outlet />
      </main>
      {!isMessengerPage && (
        <Footer />
      )}
    </div>
  );
}