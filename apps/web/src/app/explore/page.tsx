"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Search, MapPin, Globe, ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Campaign } from "@/types";
import Link from "next/link";

const CATEGORIES = ["All", "Borehole", "School", "Clinic", "App", "Course"];

export default function ExplorePage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const campaigns = useQuery(api.campaigns.listAllCampaigns, {
        category: selectedCategory === "All" ? undefined : selectedCategory.toLowerCase(),
    });

    return (
        <main className="flex-1 flex flex-col">
            <Navbar />

            <section className="pt-20 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tighter mb-6">Explore Campaigns</h1>

                    <div className="flex flex-wrap gap-3 mb-12">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedCategory === cat
                                    ? "bg-[#14F195] text-black"
                                    : "glass hover:bg-white/10"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {campaigns === undefined ? (
                            [1, 2, 3, 4, 5, 6].map((i: number) => <SkeletonCard key={i} />)
                        ) : campaigns.length === 0 ? (
                            <div className="col-span-3 text-center py-20 glass rounded-3xl">
                                <p className="text-neutral-400">No campaigns found in this category.</p>
                            </div>
                        ) : (
                            campaigns.map((campaign: Campaign) => (
                                <CampaignCard key={campaign._id} campaign={campaign} />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
    const progress = Math.min(100, (campaign.raisedAmountLamports / campaign.targetAmountLamports) * 100) || 0;

    return (
        <Link href={`/campaign/${campaign._id}`} className="block group">
            <div className="glass rounded-3xl overflow-hidden hover:border-white/20 transition-all h-full flex flex-col group-hover:bg-white/[0.05]">
                <div className="h-48 bg-neutral-900 relative">
                    <div className="absolute top-4 left-4 bg-[#14F195] text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                        {campaign.category || "General"}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        {campaign.projectType === "offline" ? <MapPin size={10} /> : <Globe size={10} />}
                        {campaign.projectType.toUpperCase()}
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#14F195] transition-colors line-clamp-1">{campaign.title}</h3>
                    <p className="text-neutral-400 text-sm mb-6 line-clamp-2 flex-1">{campaign.description}</p>

                    <div className="space-y-4">
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-[#14F195] to-[#9945FF]"
                            />
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-[#14F195]">{progress.toFixed(0)}% Funded</span>
                            <span>{(campaign.targetAmountLamports / 1e9).toFixed(2)} SOL Goal</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function SkeletonCard() {
    return (
        <div className="glass rounded-3xl overflow-hidden animate-pulse h-[400px]">
            <div className="h-48 bg-white/5" />
            <div className="p-6 space-y-4">
                <div className="h-6 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-5/6" />
                <div className="pt-4 space-y-2">
                    <div className="h-2 bg-white/5 rounded-full" />
                    <div className="flex justify-between">
                        <div className="h-3 bg-white/5 rounded w-16" />
                        <div className="h-3 bg-white/5 rounded w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
