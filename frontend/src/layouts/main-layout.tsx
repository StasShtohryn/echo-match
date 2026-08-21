import { Outlet } from "react-router";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}