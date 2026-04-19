"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function CreateCampaignPage() {
    const { publicKey, connected } = useWallet();
    const createCampaign = useMutation(api.campaigns.createCampaign);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "borehole",
        projectType: "offline",
        targetAmountSol: "1",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) return;

        setLoading(true);
        try {
            const campaignId = await createCampaign({
                hostId: publicKey.toString(),
                title: formData.title,
                description: formData.description,
                category: formData.category,
                projectType: formData.projectType,
                targetAmountLamports: parseFloat(formData.targetAmountSol) * 1e9,
                deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
            });

            router.push(`/explore`);
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert("Failed to create campaign. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!connected) {
        return (
            <main className="flex-1 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-4xl font-bold mb-6 tracking-tighter">Connect your wallet to start a campaign</h1>
                    <p className="text-neutral-400 mb-8 max-w-md">
                        You need to be connected with a Solana wallet to create and manage your SolPact campaigns.
                    </p>
                    <WalletMultiButton className="!bg-[#14F195] !text-black !rounded-full !font-bold" />
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col">
            <Navbar />

            <section className="pt-20 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl font-bold tracking-tighter mb-4">Start a Campaign</h1>
                    <p className="text-neutral-400 mb-12">Fill in the details below to launch your transparent crowdfunding project.</p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-neutral-500">Project Title</label>
                            <input
                                required
                                type="text"
                                placeholder="E.g., Clean Water for Owerri Community"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#14F195] transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-neutral-500">Description</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Describe your project, the impact it will have, and how the funds will be used."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#14F195] transition-all resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-neutral-500">Category</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#14F195] transition-all appearance-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="borehole">Borehole</option>
                                    <option value="school">School</option>
                                    <option value="clinic">Clinic</option>
                                    <option value="app">App/Software</option>
                                    <option value="course">Education/Course</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-neutral-500">Target Amount (SOL)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#14F195] transition-all"
                                    value={formData.targetAmountSol}
                                    onChange={(e) => setFormData({ ...formData, targetAmountSol: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-neutral-500">Project Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, projectType: "offline" })}
                                    className={`px-6 py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.projectType === "offline"
                                        ? "bg-[#14F195]/10 border-[#14F195] text-[#14F195]"
                                        : "border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <span className="font-bold">Offline</span>
                                    <span className="text-xs opacity-60">Physical project (e.g., building)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, projectType: "online" })}
                                    className={`px-6 py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.projectType === "online"
                                        ? "bg-[#9945FF]/10 border-[#9945FF] text-[#9945FF]"
                                        : "border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <span className="font-bold">Online</span>
                                    <span className="text-xs opacity-60">Digital project (e.g., software)</span>
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-[#14F195] text-black font-bold py-5 rounded-2xl text-xl hover:bg-[#00FFA3] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)] transform hover:-translate-y-1 active:translate-y-0"
                        >
                            {loading ? "Creating..." : "Launch Campaign"}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}
