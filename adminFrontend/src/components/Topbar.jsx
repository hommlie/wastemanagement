import React, { useEffect, useRef, useState } from "react";
import { BellIcon, UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Topbar({ notificationsCount = 3 }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="fixed top-0 left-72 right-0 bg-white shadow-sm h-16 flex items-center justify-end px-6 z-40"
      style={{ backdropFilter: "saturate(180%) blur(0px)" }} // optional nice effect
    >
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md hover:bg-gray-50">
          <BellIcon className="w-6 h-6 text-emerald-800" />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {notificationsCount}
          </span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 px-3 py-1 bg-white border border-gray-200 rounded-full hover:shadow"
          >
            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-emerald-800" />
            </span>
            <span className="text-gray-700 font-medium">{user?.name || "Admin"}</span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-600 transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-48 py-2 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <span>⟶</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
