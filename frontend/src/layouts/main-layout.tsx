import { Outlet, useLocation } from "react-router";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BottomNav from "@/components/bottom-nav";

import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { trackAppVisitAndRemind } from "@/lib/location-reminder"
import { useAuthStore } from "@/store/useAuthStore";
import { SplashScreen } from "@/components/splash-screen";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isMessengerPage = pathname === "/messenger" || pathname.startsWith("/messenger/");
  const isTestPage = pathname.includes("/test") || pathname.includes("/onboarding") || pathname.includes("/register");

  const navigate = useNavigate()

  useEffect(() => {
    trackAppVisitAndRemind(() => {
      navigate("/settings")
    })
  }, [navigate])
  const { isInitializing, isLoading } = useAuthStore();
  const [minSplashDone, setMinSplashDone] = useState(false);

  const showSplash = isInitializing || isLoading || !minSplashDone;

  if (showSplash) {
    return (
      <SplashScreen
        durationMs={2200}
        onFinish={() => setMinSplashDone(true)}
      />
    );
  }

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
      <BottomNav />
    </div>
  );
}
