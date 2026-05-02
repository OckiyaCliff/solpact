"use client";

import { useState, useEffect, useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import PillNav from "./PillNav";

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "";

export function Navbar() {
    const [mounted, setMounted] = useState(false);
    const { publicKey, connected } = useWallet();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isAdmin = connected && publicKey?.toString() === ADMIN_WALLET;

    const navItems = useMemo(() => {
        const items = [
            { label: "Home", href: "/" },
            { label: "Explore", href: "/explore" },
            { label: "Create", href: "/create" },
            { label: "Verify", href: "/verify" },
        ];
        if (isAdmin) {
            items.push({ label: "Admin", href: "/admin" });
        }
        return items;
    }, [isAdmin]);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            {/* The wrapper is pointer-events-none so we can click HERO items, 
                but children (Nav/Wallet) must re-enable pointer events */}
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-start">
                <div className="pointer-events-auto">
                    <PillNav
                        logo="/solpact_icon.png"
                        logoAlt="SolPact Logo"
                        items={navItems}
                        rightElement={
                            mounted && (
                                <div className="scale-80 origin-right">
                                    <WalletMultiButton className="!bg-[#14F195] !text-black !rounded-full !font-bold !text-sm px-6 hover:!bg-[#00FFA3] transition-all !h-[36px] !leading-none" />
                                </div>
                            )
                        }
                        baseColor="#0A0A0B"
                        pillColor="#1A1A1C"
                        pillTextColor="#ffffff"
                        hoveredPillTextColor="#14F195"
                        className="shadow-2xl shadow-black/40"
                    />
                </div>
            </div>
        </div>
    );
}
