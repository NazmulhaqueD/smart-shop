"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Home,
  Info,
  Phone,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggler from "../ThemeToggler";
import Gems from "./Gems";
import DropDown from "./DropDown";
// import useCart from "@/context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role } = useAuth();
  const pathname = usePathname();
  // const { cartItems } = useCart();

  const dashboardPath =
    role === "admin"
      ? "/dashboard/admin"
      : role === "seller"
      ? "/dashboard/seller"
      : "/dashboard/user";

  const links = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    {
      name: "Products",
      path: "/products",
      icon: <Package className="w-4 h-4" />,
    },
    { name: "About", path: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Contact", path: "/contact", icon: <Phone className="w-4 h-4" /> },
    ...(user?.email
      ? [
          {
            name: "Dashboard",
            path: dashboardPath,
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const linkClass = (path) =>
    pathname === path
      ? "text-primary font-semibold underline"
      : "text-base-content hover:text-primary hover:underline";

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-base-100 shadow-md sticky top-0 z-50 text-base-content">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1 rounded-md hover:bg-neutral/10 transition"
            >
              {isOpen ? (
                <X className="w-7 h-7 text-base-content" />
              ) : (
                <Menu className="w-7 h-7 text-base-content" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo_3.webp"
                alt="Smart Shop Logo"
                width={60}
                height={60}
                className="rounded-xl"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-1 ${linkClass(link.path)}`}
              >
                {link.icon} {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggler />
            <Gems />

            <Link href="/cartPage" className="relative">
              <ShoppingCart className="w-6 h-6 text-base-content hover:text-primary" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                {/* cartItems?.length || */} 2
              </span>
            </Link>

            {!user ? (
              <Link href="/login">
                <User className="w-6 h-6 text-base-content hover:text-primary" />
              </Link>
            ) : (
              <DropDown>
                <Image
                  src={user.photoURL || "/default-avatar.png"}
                  alt="profile"
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer border hover:ring-2 hover:ring-primary transition-all ring-2 ring-offset-2"
                />
              </DropDown>
            )}
          </div>

          {/* Mobile Right */}
          <div className="md:hidden flex items-center">
            {!user ? (
              <Link href="/login">
                <User className="w-6 h-6 text-base-content hover:text-primary" />
              </Link>
            ) : (
              <DropDown>
                <Image
                  src={user.photoURL || "/default-avatar.png"}
                  alt="profile"
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer border hover:ring-2 hover:ring-primary transition-all ring-2 ring-offset-2"
                />
              </DropDown>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden text-base-content shadow-lg px-6 pt-2 pb-4 space-y-4 bg-base-100 rounded-b-lg">
          <div className="flex flex-col space-y-3">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={closeMenu}
                className={`flex items-center gap-2 p-2 rounded hover:bg-neutral/10 ${linkClass(
                  link.path
                )}`}
              >
                {link.icon} {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3">
            <ThemeToggler />
          </div>

          <div className="flex items-center space-x-6 pt-4">
            <Link href="/cartPage" className="relative" onClick={closeMenu}>
              <ShoppingCart className="w-6 h-6 text-base-content hover:text-primary" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                2
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
