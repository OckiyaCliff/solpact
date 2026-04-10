"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link } from "lucide-react";
import NextLink from "next/link";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full glass px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#14F195] to-[#9945FF] rounded-lg flex items-center justify-center shadow-lg transform rotate-3">
                    <span className="font-bold text-xl text-black">S</span>
                </div>
                <NextLink href="/" className="text-2xl font-bold tracking-tighter">
                    SolPact
                </NextLink>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <NextLink href="/explore" className="text-sm font-medium hover:text-[#14F195] transition-colors">
                    Explore
                </NextLink>
                <NextLink href="/create" className="text-sm font-medium hover:text-[#14F195] transition-colors">
                    Create
                </NextLink>
                <NextLink href="/verify" className="text-sm font-medium hover:text-[#14F195] transition-colors">
                    Verifier Portal
                </NextLink>
            </div>

            <div className="flex items-center gap-4">
                <WalletMultiButton className="!bg-[#14F195] !text-black !rounded-full !font-bold !text-sm px-6 hover:!bg-[#00FFA3] transition-all" />
            </div>
        </nav>
    );
}
