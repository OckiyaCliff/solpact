"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    SystemProgram,
    Transaction,
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Id } from "../../convex/_generated/dataModel";
import { Loader2, Heart, ExternalLink } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface DonateButtonProps {
    campaignId: Id<"campaigns">;
    campaignTitle: string;
    hostWallet: string;
    onDonationComplete?: () => void;
}

export default function DonateButton({
    campaignId,
    campaignTitle,
    hostWallet,
    onDonationComplete,
}: DonateButtonProps) {
    const { publicKey, sendTransaction, connected } = useWallet();
    const { connection } = useConnection();
    const recordDonation = useMutation(api.donations.recordDonation);

    const [amount, setAmount] = useState("");
    const [donating, setDonating] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const presetAmounts = ["0.1", "0.5", "1", "2", "5"];

    const handleDonate = async () => {
        if (!publicKey || !amount || parseFloat(amount) <= 0) return;

        setDonating(true);
        setError(null);
        setSuccess(null);

        try {
            const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(hostWallet),
                    lamports,
                })
            );

            const signature = await sendTransaction(transaction, connection);

            // Wait for confirmation
            await connection.confirmTransaction(signature, "confirmed");

            // Record in Convex
            await recordDonation({
                campaignId,
                donorId: publicKey.toString(),
                amountLamports: lamports,
                txSignature: signature,
            });

            setSuccess(signature);
            setAmount("");
            onDonationComplete?.();
        } catch (err: any) {
            console.error("Donation failed:", err);
            setError(err.message || "Transaction failed. Please try again.");
        } finally {
            setDonating(false);
        }
    };

    if (!connected) {
        return (
            <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold">Support this project</h3>
                <p className="text-sm text-neutral-400">
                    Connect your Solana wallet to donate
                </p>
                <WalletMultiButton className="!bg-[#14F195] !text-black !rounded-xl !font-bold !w-full !justify-center" />
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Support this project
            </h3>

            {/* Preset amounts */}
            <div className="flex flex-wrap gap-2">
                {presetAmounts.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            amount === preset
                                ? "bg-[#14F195] text-black"
                                : "bg-white/5 border border-white/10 hover:border-white/20"
                        }`}
                    >
                        {preset} SOL
                    </button>
                ))}
            </div>

            {/* Custom amount */}
            <div className="relative">
                <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    placeholder="Custom amount"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-16 outline-none focus:border-[#14F195] transition-all text-lg font-bold"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 font-bold">
                    SOL
                </span>
            </div>

            {/* Donate button */}
            <button
                onClick={handleDonate}
                disabled={donating || !amount || parseFloat(amount) <= 0}
                className="w-full bg-[#14F195] text-black font-bold py-4 rounded-xl text-base hover:bg-[#00FFA3] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
                {donating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming Transaction...
                    </>
                ) : (
                    <>
                        <Heart className="w-5 h-5" />
                        Donate {amount ? `${amount} SOL` : ""}
                    </>
                )}
            </button>

            {/* Success */}
            {success && (
                <div className="bg-[#14F195]/10 border border-[#14F195]/20 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-bold text-[#14F195]">
                        🎉 Donation successful!
                    </p>
                    <a
                        href={`https://explorer.solana.com/tx/${success}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        View on Solana Explorer
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
