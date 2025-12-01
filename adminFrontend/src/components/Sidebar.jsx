import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  KeyIcon,
  MapPinIcon,
  TagIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const menu = [
  { id: "dashboard", name: "Dashboard", to: "/dashboard", icon: HomeIcon },
  { id: "orders", name: "Orders Management", to: "/dashboard/orders", icon: ShoppingCartIcon },
  {
    id: "management",
    name: "Management",
    icon: Squares2X2Icon,
    children: [
      { name: "User Management", to: "/dashboard/users", icon: UsersIcon },
      { name: "Role Management", to: "/dashboard/roles", icon: UserGroupIcon },
      { name: "Permission Management", to: "/dashboard/permissions", icon: KeyIcon },
    ],
  },
  {
    id: "locations",
    name: "Locations",
    icon: MapPinIcon,
    children: [
      { name: "State Management", to: "/dashboard/states", icon: MapPinIcon },
      { name: "City Management", to: "/dashboard/cities", icon: MapPinIcon },
      { name: "Zone Management", to: "/dashboard/zones", icon: MapPinIcon },
    ],
  },
  {
    id: "catalog",
    name: "Catalog",
    icon: TagIcon,
    children: [
      { name: "Module Management", to: "/dashboard/modules", icon: Squares2X2Icon },
      { name: "Category Management", to: "/dashboard/categories", icon: TagIcon },
      { name: "Variation Management", to: "/dashboard/variations", icon: TagIcon },
    ],
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(null);

  const toggle = (id) => setOpen((prev) => (prev === id ? null : id));

  return (
    <aside className="w-72 bg-emerald-900 text-white min-h-screen fixed left-0 top-0 z-40 shadow-lg">
      <div className="px-6 py-4 flex items-center gap-3 border-b border-emerald-800">
        <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center">
          <span className="text-2xl font-extrabold text-emerald-50">E</span>
        </div>
        <div>
          <div className="font-bold text-lg">Ecosphere</div>
          <div className="text-xs text-emerald-200">Waste Solution</div>
        </div>
      </div>

      <nav className="px-2 py-4 overflow-auto" style={{ height: "calc(100vh - 88px)" }}>
        {menu.map((m) => {
          const Icon = m.icon;
          if (m.children) {
            const isOpen = open === m.id;
            return (
              <div key={m.id} className="px-2">
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md my-1 text-sm transition ${
                    isOpen ? "bg-emerald-800/70" : "hover:bg-emerald-800/30"
                  }`}
                >
                  <Icon className="h-5 w-5 text-emerald-100" />
                  <span className="flex-1 text-left">{m.name}</span>
                  {isOpen ? <ChevronUpIcon className="h-4 w-4 text-emerald-100" /> : <ChevronDownIcon className="h-4 w-4 text-emerald-100" />}
                </button>

                {isOpen && (
                  <div className="pl-10 pr-2">
                    {m.children.map((c) => {
                      const CIcon = c.icon;
                      return (
                        <NavLink
                          key={c.to}
                          to={c.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm my-1 transition ${
                              isActive ? "bg-emerald-800/70 text-white" : "hover:bg-emerald-800/20 text-emerald-100"
                            }`
                          }
                        >
                          <CIcon className="h-4 w-4 text-emerald-100" />
                          <span>{c.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={m.id}
              to={m.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md my-1 text-sm transition ${
                  isActive ? "bg-emerald-800/70" : "hover:bg-emerald-800/30"
                }`
              }
            >
              <Icon className="h-5 w-5 text-emerald-100" />
              <span>{m.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 w-full px-6 py-4 border-t border-emerald-800">
        <div className="text-xs text-emerald-200">© {new Date().getFullYear()} Hommlie</div>
      </div>
    </aside>
  );
}
