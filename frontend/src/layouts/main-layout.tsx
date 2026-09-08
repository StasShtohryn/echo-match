import { Outlet } from "react-router";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout() {
  return (
    <div>
      <div className="flex h-screen min-h-svh flex-col overflow-hidden">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}