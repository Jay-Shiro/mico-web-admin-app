"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/admin",
        visible: ["admin", "account"],
      },
      {
        icon: "/riders.png",
        label: "Riders",
        href: "/list/riders",
        visible: ["admin"],
      },
      {
        icon: "/tracking.png",
        label: "Tracking",
        href: "/",
        visible: ["admin", "support"],
      },
      {
        icon: "/delivery.png",
        label: "Deliveries",
        href: "/list/deliveries",
        visible: ["account"],
      },
      {
        icon: "/chat.png",
        label: "Chat",
        href: "/support",
        visible: ["support"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "account", "support"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "account", "support"],
      },

      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "account", "support"],
      },
    ],
  },
];

const Menu = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-500 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(userRole)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 md:px-2 rounded-md hover:bg-color1lite"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
