import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const leftOffset = () => {
    if (typeof window === "undefined") return collapsed ? 80 : 288;
    return window.innerWidth >= 768 ? (collapsed ? 80 : 288) : 0;
  };
  const [leftPx, setLeftPx] = useState(leftOffset());
  useEffect(() => {
    function onResize() {
      setLeftPx(leftOffset());
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [collapsed]);
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} collapsed={collapsed} />
      <Topbar
        onOpenMobile={() => setMobileOpen(true)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((s) => !s)}
      />
      <main
        className="pt-16 pb-16 min-h-[calc(100vh-4rem)]"
        style={{ marginLeft: leftPx, transition: "margin-left 200ms ease" }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <Footer collapsed={collapsed} />
    </div>
  );
}
