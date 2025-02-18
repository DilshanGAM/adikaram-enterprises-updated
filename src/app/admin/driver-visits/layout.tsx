"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Helper to check if a route is active
  const isActive = (route: string) => pathname === route;

  return (
    <div className="w-full pt-[75px] relative">
      {/* Navigation Buttons */}
      <div className="flex bg-[#f3f4f6]  py-4 h-[75px]  w-full absolute top-0 left-0 justify-center items-center">
        <Link href="/admin/driver-visits">
          <button
            className={`px-4 py-2 rounded mx-2 ${
              isActive("/admin/driver-visits")
                ? "bg-pepsiBlue text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Active Visits
          </button>
        </Link>
        <Link href="/admin/driver-visits/all">
          <button
            className={`px-4 py-2 rounded mx-2 ${
              isActive("/admin/driver-visits/all")
                ? "bg-pepsiBlue text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            All visits
          </button>
        </Link>
      </div>
      {/* Children */}
      <div className="w-full h-[calc(100vh-75px)] max-h-[calc(100vh-75px)] overflow-y-hidden">{children}</div>
    </div>
  );
}
