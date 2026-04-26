"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/transactions", label: "Transactions" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <nav className="w-full border-b border-stone-200 bg-[#fdfbf7]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -ml-2 text-stone-600 sm:hidden hover:text-stone-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link href="/" className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 hover:text-stone-600 transition-colors uppercase">
            Tama Arts
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`transition-colors ${
                    isActive ? "text-orange-600" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Mobile Links Overlay */}
      {isOpen && (
        <div className="sm:hidden border-t border-stone-100 bg-[#fdfbf7] py-4 px-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className={`font-bold py-3 px-4 rounded-xl text-sm transition-all ${
                    isActive 
                      ? "bg-orange-50 text-orange-600" 
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
