import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentication Screens",
  description: "Authenticating and assigning user roles",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Add session check
  const session = await getServerSession(authOptions);

  // Redirect to login if no session exists
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="h-screen flex">
      {/*LEFT*/}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%]  p-4">
        <Link
          href="/admin"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/mico_logo.png" alt="logo" width={84} height={84} />
          <span className="hidden lg:block pt-6 font-bold">
            {session.user.role}
          </span>
        </Link>
        <Menu />
      </div>
      {/*RIGHT*/}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#f7f8fa] overflow-scroll">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
