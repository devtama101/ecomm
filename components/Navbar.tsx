"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton, SignInButton } from "@clerk/nextjs";
import CartIcon from "./CartIcon";
import CartSidebar from "./CartSidebar";

interface NavbarProps {
  userId: string | null;
  isAdmin: boolean;
  brandName?: string;
}

export default function Navbar({ userId, isAdmin, brandName = "Tama Arts" }: NavbarProps) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-stone-200 bg-[#fdfbf7]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href={isAdmin ? "/admin" : "/"}
            className="text-2xl font-black tracking-tighter text-stone-900 uppercase"
          >
            {brandName}
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium text-stone-500">
            {userId ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="hover:text-stone-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="hover:text-stone-900 transition-colors"
                    >
                      Orders
                    </Link>
                    <CartIcon onClick={() => setCartOpen(true)} />
                  </>
                )}
                <UserButton />
              </>
            ) : (
              <>
                <CartIcon onClick={() => setCartOpen(true)} />
                <SignInButton mode="modal" forceRedirectUrl="/">
                  <button className="px-5 py-2.5 bg-stone-900 text-[#fdfbf7] rounded-full hover:bg-stone-800 transition-all font-semibold shadow-md">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </nav>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
