"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Campaign } from "@/types";
import { Shield, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

export default function VerifyPage() {
    const { publicKey } = useWallet();
    const verifications = useQuery(api.verifications.getVerificationQueue);
    const stats = useQuery(api.verifications.getVerifierStats);
    const user = useQuery(api.users.getByWallet, publicKey ? { walletAddress: publicKey.toString() } : "skip");

    return (
        <main className="flex-1 flex flex-col">
            <Navbar />

            <section className="pt-20 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div>
                            <h1 className="text-5xl font-bold tracking-tighter mb-4">Verifier Portal</h1>
                            <p className="text-neutral-400 max-w-xl">
                                Support the SolPact ecosystem by verifying physical project milestones.
                                Your verification ensures funds are released safely to local communities.
                            </p>
                        </div>
                        <div className="bg-[#14F195]/10 border border-[#14F195]/20 rounded-2xl p-6 flex items-center gap-4">
                            <Shield className="w-10 h-10 text-[#14F195]" />
                            <div>
                                <div className="text-sm font-bold uppercase tracking-wider text-[#14F195]">Verifier Status</div>
                                <div className="text-xl font-bold capitalize">{user?.role || "Guest Verifier"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-white/5 mb-12">
                        <StatusStat
                            icon={<Clock className="text-amber-500" />}
                            label="Pending Review"
                            value={stats?.pendingReview?.toString() || "0"}
                        />
                        <StatusStat
                            icon={<CheckCircle className="text-[#14F195]" />}
                            label="Verified Today"
                            value={stats?.verifiedToday?.toString() || "0"}
                        />
                        <StatusStat
                            icon={<AlertCircle className="text-red-500" />}
                            label="Needs Proof"
                            value={stats?.needsProof?.toString() || "0"}
                        />
                    </div>

                    <h2 className="text-3xl font-bold mb-8">Verification Queue</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {verifications === undefined ? (
                            [1, 2, 3].map((i: number) => <div key={i} className="h-24 glass animate-pulse rounded-2xl" />)
                        ) : verifications.length === 0 ? (
                            <div className="text-center py-20 glass rounded-3xl">
                                <p className="text-neutral-400">No verifications currently require review.</p>
                            </div>
                        ) : (
                            verifications.map(({ _id, campaign, proofUrls, createdAt }: any) => (
                                <div key={_id} className="glass p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-bold text-[#14F195]">
                                            {campaign.title.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{campaign.title}</h3>
                                            <div className="text-sm text-neutral-400">
                                                {campaign.category} • {proofUrls.length} Proofs submitted {new Date(createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-sm">
                                        <div className="text-center">
                                            <div className="text-neutral-500 uppercase text-[10px] font-bold">Target</div>
                                            <div className="font-bold">{(campaign.targetAmountLamports / 1e9).toFixed(2)} SOL</div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/verify/${_id}`}
                                        className="bg-[#14F195] text-black hover:bg-[#00FFA3] px-6 py-3 rounded-xl font-bold transition-all text-sm"
                                    >
                                        Review Proofs
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

function StatusStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
            <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    );
}
