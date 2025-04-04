"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex items-center justify-between p-4">
      {/*SEARCH BAR*/}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] bg-transparent outline-none p-2"
        />
      </div>
      {/*ICONS AND USER*/}
      <div className="flex items-center gap-6 w-full justify-end">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-[#001f3e] text-white rounded-full text-xs">
            1
          </div>
        </div>
        {session?.user && (
          <>
            <div className="flex flex-col">
              <span className="text-xs leading-3 font-medium">
                {session.user.username}
              </span>
              <span className="text-[10px] text-gray-500 text-right">
                {session.user.role}
              </span>
            </div>
            <div className="relative" ref={dropdownRef}>
              <Image
                src="/avatar.png"
                alt=""
                width={36}
                height={36}
                className="rounded-full cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Image src="/logout.png" alt="" width={16} height={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
