"use client";

import { useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import PillNav from "./PillNav";

export function Navbar() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Explore", href: "/explore" },
        { label: "Create", href: "/create" },
        { label: "Verify", href: "/verify" },
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            {/* The wrapper is pointer-events-none so we can click HERO items, 
                but children (Nav/Wallet) must re-enable pointer events */}
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-start justify-between">
                <div className="pointer-events-auto">
                    <PillNav
                        logo="/solpact_icon.png"
                        logoAlt="SolPact Logo"
                        items={navItems}
                        baseColor="#0A0A0B"
                        pillColor="#1A1A1C"
                        pillTextColor="#ffffff"
                        hoveredPillTextColor="#14F195"
                        className="shadow-2xl shadow-black/40"
                    />
                </div>

                <div className="pointer-events-auto flex items-center h-[42px]">
                    {mounted && (
                        <div className="scale-90 origin-right">
                            <WalletMultiButton className="!bg-[#14F195] !text-black !rounded-full !font-bold !text-sm px-6 hover:!bg-[#00FFA3] transition-all" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
