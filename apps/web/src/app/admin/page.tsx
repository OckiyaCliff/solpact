"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { Id } from "../../../convex/_generated/dataModel";
import {
    Shield, Trash2, Eye, EyeOff, Users, BarChart3,
    AlertTriangle, X, Loader2, ExternalLink, Ban, CheckCircle,
} from "lucide-react";
import Link from "next/link";

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "";

export default function AdminPage() {
    const { publicKey, connected } = useWallet();
    const isAdmin = connected && publicKey?.toString() === ADMIN_WALLET;

    const stats = useQuery(api.admin.getAdminStats);
    const campaigns = useQuery(api.admin.getAllCampaignsAdmin);
    const users = useQuery(api.admin.listAllUsers);

    const suspendCampaign = useMutation(api.admin.suspendCampaign);
    const unsuspendCampaign = useMutation(api.admin.unsuspendCampaign);
    const deleteCampaign = useMutation(api.admin.deleteCampaign);

    const [tab, setTab] = useState<"campaigns" | "users">("campaigns");
    const [suspendModal, setSuspendModal] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<string | null>(null);
    const [suspendReason, setSuspendReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    if (!connected) {
        return (
            <main className="flex-1 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Shield className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
                        <p className="text-neutral-400">Connect your admin wallet to access this page.</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!isAdmin) {
        return (
            <main className="flex-1 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
                        <p className="text-neutral-400 mb-6">Your wallet is not authorized as an admin.</p>
                        <Link href="/" className="bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">Go Home</Link>
                    </div>
                </div>
            </main>
        );
    }

    const handleSuspend = async () => {
        if (!suspendModal || !suspendReason.trim()) return;
        setActionLoading(true);
        try {
            await suspendCampaign({ campaignId: suspendModal as Id<"campaigns">, reason: suspendReason, adminWallet: publicKey!.toString() });
            setSuspendModal(null);
            setSuspendReason("");
        } catch (e) { console.error(e); alert("Failed to suspend campaign"); }
        finally { setActionLoading(false); }
    };

    const handleUnsuspend = async (id: string) => {
        setActionLoading(true);
        try { await unsuspendCampaign({ campaignId: id as Id<"campaigns"> }); }
        catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        setActionLoading(true);
        try { await deleteCampaign({ campaignId: deleteModal as Id<"campaigns"> }); setDeleteModal(null); }
        catch (e) { console.error(e); alert("Failed to delete campaign"); }
        finally { setActionLoading(false); }
    };

    const truncate = (s: string) => s.length > 8 ? `${s.slice(0, 4)}...${s.slice(-4)}` : s;

    return (
        <main className="flex-1 flex flex-col">
            <Navbar />
            <section className="pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#14F195]/10 rounded-xl"><Shield className="w-6 h-6 text-[#14F195]" /></div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tighter">Admin Dashboard</h1>
                            <p className="text-xs text-neutral-500">{truncate(publicKey!.toString())}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { label: "Total Campaigns", value: stats.totalCampaigns, color: "text-white" },
                                { label: "Active", value: stats.activeCampaigns, color: "text-[#14F195]" },
                                { label: "Suspended", value: stats.suspendedCampaigns, color: "text-red-400" },
                                { label: "Total Raised", value: `${stats.totalRaisedSol.toFixed(2)} SOL`, color: "text-[#9945FF]" },
                            ].map((s) => (
                                <div key={s.label} className="glass rounded-2xl p-5">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">{s.label}</div>
                                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {(["campaigns", "users"] as const).map((t) => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-5 py-2 rounded-full font-bold text-sm transition-all capitalize ${tab === t ? "bg-[#14F195] text-black" : "glass hover:bg-white/10"}`}>
                                {t === "campaigns" ? <><BarChart3 className="w-4 h-4 inline mr-2" />Campaigns</> : <><Users className="w-4 h-4 inline mr-2" />Users</>}
                            </button>
                        ))}
                    </div>

                    {/* Campaigns tab */}
                    {tab === "campaigns" && (
                        <div className="space-y-3">
                            {campaigns === undefined ? (
                                [1, 2, 3].map((i) => <div key={i} className="h-20 glass animate-pulse rounded-2xl" />)
                            ) : campaigns.length === 0 ? (
                                <div className="glass rounded-2xl p-8 text-center text-neutral-400">No campaigns yet.</div>
                            ) : (
                                campaigns.map((c: any) => (
                                    <div key={c._id} className={`glass rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 transition-all ${c.isSuspended ? "border-red-500/20 bg-red-500/5" : ""}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {c.coverImageUrl ? (
                                                <img src={c.coverImageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-[#14F195]">{c.title.charAt(0)}</div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold truncate">{c.title}</h3>
                                                    {c.isSuspended && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">Suspended</span>}
                                                </div>
                                                <div className="text-xs text-neutral-500">{c.category} • {truncate(c.hostId)} • {new Date(c.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-bold text-[#14F195]">{(c.raisedAmountLamports / 1e9).toFixed(2)} / {(c.targetAmountLamports / 1e9).toFixed(2)} SOL</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/campaign/${c._id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View">
                                                <Eye className="w-4 h-4 text-neutral-400" />
                                            </Link>
                                            {c.isSuspended ? (
                                                <button onClick={() => handleUnsuspend(c._id)} className="p-2 hover:bg-[#14F195]/10 rounded-lg transition-colors" title="Unsuspend">
                                                    <CheckCircle className="w-4 h-4 text-[#14F195]" />
                                                </button>
                                            ) : (
                                                <button onClick={() => setSuspendModal(c._id)} className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors" title="Suspend">
                                                    <EyeOff className="w-4 h-4 text-amber-500" />
                                                </button>
                                            )}
                                            <button onClick={() => setDeleteModal(c._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Users tab */}
                    {tab === "users" && (
                        <div className="space-y-3">
                            {users === undefined ? (
                                [1, 2, 3].map((i) => <div key={i} className="h-16 glass animate-pulse rounded-2xl" />)
                            ) : users.length === 0 ? (
                                <div className="glass rounded-2xl p-8 text-center text-neutral-400">No users registered yet.</div>
                            ) : (
                                users.map((u: any) => (
                                    <div key={u._id} className="glass rounded-2xl p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#14F195]/20 to-[#9945FF]/20 rounded-full flex items-center justify-center font-bold text-sm">{(u.displayName || u.walletAddress).charAt(0).toUpperCase()}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm">{u.displayName || "Anonymous"}</div>
                                            <div className="text-xs text-neutral-500">{truncate(u.walletAddress)}</div>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${u.role === "admin" ? "bg-[#14F195]/10 text-[#14F195]" : "bg-white/5 text-neutral-400"}`}>{u.role}</span>
                                        <span className="text-xs text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Suspend Modal */}
            {suspendModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-8 max-w-md w-full space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Suspend Campaign</h2>
                            <button onClick={() => setSuspendModal(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-neutral-400">This will hide the campaign from public view. You can unsuspend it later.</p>
                        <textarea rows={3} placeholder="Reason for suspension..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-all resize-none text-sm"
                            value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
                        <div className="flex gap-3">
                            <button onClick={() => setSuspendModal(null)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
                            <button onClick={handleSuspend} disabled={actionLoading || !suspendReason.trim()}
                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-amber-500 text-black hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Suspend
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-8 max-w-md w-full space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-500" /> Delete Campaign</h2>
                            <button onClick={() => setDeleteModal(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-neutral-400">This action is <strong className="text-red-400">permanent</strong>. The campaign, all donations records, and uploaded images will be deleted.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
                            <button onClick={handleDelete} disabled={actionLoading}
                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Delete Permanently
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
