"use client";

import { use, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import DonateButton from "@/components/DonateButton";
import VideoEmbed from "@/components/VideoEmbed";
import {
    ArrowLeft,
    MapPin,
    Globe,
    Clock,
    Users,
    Target,
    ExternalLink,
    Share2,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Wallet,
    Copy,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const campaign = useQuery(api.campaigns.getCampaign, {
        campaignId: id as Id<"campaigns">,
    });
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    if (campaign === undefined) {
        return (
            <main className="flex-1 flex flex-col">
                <Navbar />
                <div className="pt-24 pb-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <LoadingSkeleton />
                    </div>
                </div>
            </main>
        );
    }

    if (campaign === null) {
        return (
            <main className="flex-1 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
                        <p className="text-neutral-400 mb-8">
                            This campaign doesn&apos;t exist or has been removed.
                        </p>
                        <Link
                            href="/explore"
                            className="bg-[#14F195] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#00FFA3] transition-all"
                        >
                            Browse Campaigns
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const progress =
        Math.min(
            100,
            (campaign.raisedAmountLamports / campaign.targetAmountLamports) * 100
        ) || 0;
    const daysLeft = Math.max(
        0,
        Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24))
    );
    const isExpired = campaign.deadline < Date.now();
    const imageUrls = campaign.imageUrls || [];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const truncateWallet = (wallet: string) =>
        `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

    return (
        <main className="flex-1 flex flex-col">
            <Navbar />

            <section className="pt-24 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Back button */}
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Explore
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column: Main content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image Gallery */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {imageUrls.length > 0 ? (
                                    <div className="space-y-3">
                                        {/* Main image */}
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                                            <img
                                                src={imageUrls[activeImageIndex]}
                                                alt={campaign.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Category badge */}
                                            <div className="absolute top-4 left-4 bg-[#14F195] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                                                {campaign.category || "General"}
                                            </div>
                                            {/* Nav arrows */}
                                            {imageUrls.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            setActiveImageIndex(
                                                                (prev) =>
                                                                    (prev - 1 + imageUrls.length) %
                                                                    imageUrls.length
                                                            )
                                                        }
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setActiveImageIndex(
                                                                (prev) =>
                                                                    (prev + 1) % imageUrls.length
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {/* Thumbnail strip */}
                                        {imageUrls.length > 1 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {imageUrls.map(
                                                    (url: string, index: number) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                setActiveImageIndex(index)
                                                            }
                                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                                index === activeImageIndex
                                                                    ? "border-[#14F195]"
                                                                    : "border-white/10 hover:border-white/20"
                                                            }`}
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`Thumbnail ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#14F195]/10 to-[#9945FF]/10 border border-white/10 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <span className="text-3xl font-black text-[#14F195]">
                                                    {campaign.title.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="bg-[#14F195] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg inline-block">
                                                {campaign.category || "General"}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Title & Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="space-y-4"
                            >
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                    {campaign.title}
                                </h1>

                                {/* Meta badges */}
                                <div className="flex flex-wrap gap-3">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                        {campaign.projectType === "offline" ? (
                                            <MapPin className="w-3 h-3 text-[#14F195]" />
                                        ) : (
                                            <Globe className="w-3 h-3 text-[#9945FF]" />
                                        )}
                                        {campaign.projectType === "offline"
                                            ? "Physical Project"
                                            : "Digital Project"}
                                    </span>
                                    {campaign.locationName && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                            <MapPin className="w-3 h-3 text-neutral-400" />
                                            {campaign.locationName}
                                        </span>
                                    )}
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                                            isExpired
                                                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                                : "bg-white/5 border border-white/10"
                                        }`}
                                    >
                                        <Clock className="w-3 h-3" />
                                        {isExpired
                                            ? "Campaign ended"
                                            : `${daysLeft} days left`}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                        <Calendar className="w-3 h-3 text-neutral-400" />
                                        Created{" "}
                                        {new Date(campaign.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="glass rounded-2xl p-6">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">
                                        About this project
                                    </h2>
                                    <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                        {campaign.description}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Video embed */}
                            {campaign.videoUrl && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="space-y-3"
                                >
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                                        Project Video
                                    </h2>
                                    <VideoEmbed url={campaign.videoUrl} />
                                </motion.div>
                            )}

                            {/* Donation History */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="space-y-4"
                            >
                                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                                    Recent Donations ({campaign.donationCount})
                                </h2>
                                {campaign.donations && campaign.donations.length > 0 ? (
                                    <div className="space-y-2">
                                        {campaign.donations
                                            .sort(
                                                (a: any, b: any) =>
                                                    b.createdAt - a.createdAt
                                            )
                                            .slice(0, 10)
                                            .map((donation: any) => (
                                                <div
                                                    key={donation._id}
                                                    className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-gradient-to-br from-[#14F195]/20 to-[#9945FF]/20 rounded-lg flex items-center justify-center">
                                                            <Wallet className="w-4 h-4 text-[#14F195]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">
                                                                {truncateWallet(
                                                                    donation.donorId
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-neutral-500">
                                                                {new Date(
                                                                    donation.createdAt
                                                                ).toLocaleDateString()}{" "}
                                                                at{" "}
                                                                {new Date(
                                                                    donation.createdAt
                                                                ).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-[#14F195]">
                                                            {(
                                                                donation.amountLamports /
                                                                1e9
                                                            ).toFixed(4)}{" "}
                                                            SOL
                                                        </span>
                                                        <a
                                                            href={`https://explorer.solana.com/tx/${donation.txSignature}?cluster=devnet`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                            title="View on Solana Explorer"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="glass rounded-2xl p-8 text-center">
                                        <p className="text-neutral-400 text-sm">
                                            No donations yet. Be the first to support this
                                            project!
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Right column: Sidebar */}
                        <div className="space-y-6">
                            {/* Progress card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="glass rounded-2xl p-6 space-y-5 sticky top-24"
                            >
                                {/* Raised amount */}
                                <div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-3xl font-black text-[#14F195]">
                                            {(
                                                campaign.raisedAmountLamports / 1e9
                                            ).toFixed(2)}
                                        </span>
                                        <span className="text-sm text-neutral-400 font-bold">
                                            SOL raised
                                        </span>
                                    </div>
                                    <div className="text-sm text-neutral-500">
                                        of{" "}
                                        {(
                                            campaign.targetAmountLamports / 1e9
                                        ).toFixed(2)}{" "}
                                        SOL goal
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="space-y-2">
                                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${progress}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                ease: "easeOut",
                                            }}
                                            className="h-full bg-gradient-to-r from-[#14F195] to-[#9945FF] rounded-full"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-[#14F195]">
                                            {progress.toFixed(0)}% funded
                                        </span>
                                        <span className="text-neutral-500">
                                            {campaign.donationCount} donors
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                        <div className="text-lg font-black">
                                            {daysLeft}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                            Days Left
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                        <div className="text-lg font-black">
                                            {campaign.donationCount}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                            Backers
                                        </div>
                                    </div>
                                </div>

                                {/* Donate section */}
                                {!isExpired &&
                                    campaign.state === "active" &&
                                    !campaign.isSuspended && (
                                        <DonateButton
                                            campaignId={
                                                campaign._id as Id<"campaigns">
                                            }
                                            campaignTitle={campaign.title}
                                            hostWallet={campaign.hostId}
                                        />
                                    )}

                                {campaign.isSuspended && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                                        <p className="text-sm font-bold text-red-400">
                                            This campaign has been suspended
                                        </p>
                                    </div>
                                )}

                                {isExpired && (
                                    <div className="bg-neutral-500/10 border border-neutral-500/20 rounded-xl p-4 text-center">
                                        <p className="text-sm font-bold text-neutral-400">
                                            This campaign has ended
                                        </p>
                                    </div>
                                )}

                                {/* Share */}
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-3 text-sm font-bold transition-all hover:bg-white/10"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-[#14F195]" />
                                            Link Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="w-4 h-4" />
                                            Share Campaign
                                        </>
                                    )}
                                </button>

                                {/* Host info */}
                                <div className="border-t border-white/5 pt-4 space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        Campaign Host
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#14F195]/20 to-[#9945FF]/20 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-black text-[#14F195]">
                                                {(
                                                    campaign.hostName ||
                                                    campaign.hostId
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {campaign.hostName || "Anonymous"}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        campaign.hostId
                                                    );
                                                }}
                                                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
                                            >
                                                {truncateWallet(campaign.hostId)}
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-8">
                <div className="aspect-video rounded-2xl bg-white/5" />
                <div className="space-y-4">
                    <div className="h-10 bg-white/5 rounded w-3/4" />
                    <div className="flex gap-3">
                        <div className="h-8 bg-white/5 rounded-lg w-32" />
                        <div className="h-8 bg-white/5 rounded-lg w-24" />
                    </div>
                    <div className="glass rounded-2xl p-6 space-y-3">
                        <div className="h-4 bg-white/5 rounded w-full" />
                        <div className="h-4 bg-white/5 rounded w-5/6" />
                        <div className="h-4 bg-white/5 rounded w-4/6" />
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="glass rounded-2xl p-6 space-y-5">
                    <div className="h-12 bg-white/5 rounded" />
                    <div className="h-3 bg-white/5 rounded-full" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 bg-white/5 rounded-xl" />
                        <div className="h-16 bg-white/5 rounded-xl" />
                    </div>
                    <div className="h-40 bg-white/5 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
