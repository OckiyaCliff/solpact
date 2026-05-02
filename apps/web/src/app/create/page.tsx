"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Id } from "../../../convex/_generated/dataModel";
import ImageUploader from "@/components/ImageUploader";
import { VideoUrlInput } from "@/components/VideoEmbed";
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Globe } from "lucide-react";

const STEPS = ["Basics", "Media", "Details", "Review"];
const CATEGORIES = [
    { value: "borehole", label: "Borehole / Water" },
    { value: "school", label: "School / Education" },
    { value: "clinic", label: "Clinic / Health" },
    { value: "app", label: "App / Software" },
    { value: "course", label: "Course / Training" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "other", label: "Other" },
];

export default function CreateCampaignPage() {
    const { publicKey, connected } = useWallet();
    const createCampaign = useMutation(api.campaigns.createCampaign);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "borehole",
        projectType: "offline",
        targetAmountSol: "1",
        deadline: "",
        locationName: "",
        hostName: "",
        hostEmail: "",
        videoUrl: "",
    });

    const [images, setImages] = useState<Id<"_storage">[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const update = (field: string, value: string) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const canProceed = () => {
        if (step === 0) return formData.title.length > 2 && formData.description.length > 10;
        if (step === 1) return true; // media is optional
        if (step === 2) return parseFloat(formData.targetAmountSol) > 0 && formData.deadline;
        return true;
    };

    const handleSubmit = async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const deadlineTs = formData.deadline
                ? new Date(formData.deadline).getTime()
                : Date.now() + 30 * 24 * 60 * 60 * 1000;

            const campaignId = await createCampaign({
                hostId: publicKey.toString(),
                title: formData.title,
                description: formData.description,
                category: formData.category,
                projectType: formData.projectType,
                targetAmountLamports: parseFloat(formData.targetAmountSol) * 1e9,
                deadline: deadlineTs,
                locationName: formData.locationName || undefined,
                hostName: formData.hostName || undefined,
                hostEmail: formData.hostEmail || undefined,
                videoUrl: formData.videoUrl || undefined,
                images: images.length > 0 ? images : undefined,
            });
            router.push(`/campaign/${campaignId}`);
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
                    <h1 className="text-2xl font-bold mb-4 tracking-tighter">Connect your wallet to start a campaign</h1>
                    <p className="text-neutral-400 mb-8 max-w-md">You need a Solana wallet to create and manage SolPact campaigns.</p>
                    <WalletMultiButton className="!bg-[#14F195] !text-black !rounded-full !font-bold" />
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col">
            <Navbar />
            <section className="pt-24 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tighter mb-2">Start a Campaign</h1>
                    <p className="text-neutral-400 mb-8 text-sm">Launch your transparent crowdfunding project on Solana.</p>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-10">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-2 flex-1">
                                <button
                                    onClick={() => i < step && setStep(i)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        i < step ? "bg-[#14F195] text-black" : i === step ? "bg-white text-black" : "bg-white/10 text-neutral-500"
                                    }`}
                                >
                                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                                </button>
                                <span className={`text-xs font-bold hidden sm:block ${i === step ? "text-white" : "text-neutral-500"}`}>{s}</span>
                                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-[#14F195]" : "bg-white/10"}`} />}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                            {/* Step 0: Basics */}
                            {step === 0 && (
                                <div className="space-y-6">
                                    <Field label="Project Title">
                                        <input required type="text" placeholder="E.g., Clean Water for Owerri Community" className="form-input" value={formData.title} onChange={(e) => update("title", e.target.value)} />
                                    </Field>
                                    <Field label="Description">
                                        <textarea required rows={5} placeholder="Describe your project, the impact it will have, and how the funds will be used..." className="form-input resize-none" value={formData.description} onChange={(e) => update("description", e.target.value)} />
                                    </Field>
                                    <Field label="Category">
                                        <select className="form-input appearance-none" value={formData.category} onChange={(e) => update("category", e.target.value)}>
                                            {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                                        </select>
                                    </Field>
                                    <Field label="Project Type">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[{ type: "offline", icon: <MapPin className="w-5 h-5" />, label: "Offline", desc: "Physical project (e.g., building)" },
                                              { type: "online", icon: <Globe className="w-5 h-5" />, label: "Online", desc: "Digital project (e.g., software)" }].map((opt) => (
                                                <button key={opt.type} type="button" onClick={() => update("projectType", opt.type)}
                                                    className={`px-6 py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                                                        formData.projectType === opt.type
                                                            ? opt.type === "offline" ? "bg-[#14F195]/10 border-[#14F195] text-[#14F195]" : "bg-[#9945FF]/10 border-[#9945FF] text-[#9945FF]"
                                                            : "border-white/10 hover:border-white/20"
                                                    }`}>
                                                    {opt.icon}
                                                    <span className="font-bold">{opt.label}</span>
                                                    <span className="text-xs opacity-60">{opt.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                </div>
                            )}

                            {/* Step 1: Media */}
                            {step === 1 && (
                                <div className="space-y-8">
                                    <Field label="Campaign Images" sublabel="Upload up to 5 images. The first image will be your cover photo.">
                                        <ImageUploader images={images} imageUrls={imageUrls} onImagesChange={(imgs, urls) => { setImages(imgs); setImageUrls(urls); }} maxImages={5} />
                                    </Field>
                                    <Field label="Video (Optional)" sublabel="Paste a YouTube or Vimeo link to embed a video on your campaign page.">
                                        <VideoUrlInput value={formData.videoUrl} onChange={(url) => update("videoUrl", url)} />
                                    </Field>
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Target Amount (SOL)">
                                            <input required type="number" step="0.1" min="0.1" className="form-input" value={formData.targetAmountSol} onChange={(e) => update("targetAmountSol", e.target.value)} />
                                        </Field>
                                        <Field label="Deadline">
                                            <input required type="date" className="form-input" value={formData.deadline} min={new Date().toISOString().split("T")[0]} onChange={(e) => update("deadline", e.target.value)} />
                                        </Field>
                                    </div>
                                    <Field label="Location (Optional)">
                                        <input type="text" placeholder="E.g., Lagos, Nigeria" className="form-input" value={formData.locationName} onChange={(e) => update("locationName", e.target.value)} />
                                    </Field>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Your Name (Optional)">
                                            <input type="text" placeholder="Display name" className="form-input" value={formData.hostName} onChange={(e) => update("hostName", e.target.value)} />
                                        </Field>
                                        <Field label="Contact Email (Optional)">
                                            <input type="email" placeholder="you@email.com" className="form-input" value={formData.hostEmail} onChange={(e) => update("hostEmail", e.target.value)} />
                                        </Field>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Review */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="glass rounded-2xl p-6 space-y-4">
                                        <h2 className="text-xl font-bold">{formData.title}</h2>
                                        <p className="text-neutral-400 text-sm whitespace-pre-wrap">{formData.description}</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <ReviewItem label="Category" value={CATEGORIES.find((c) => c.value === formData.category)?.label || formData.category} />
                                            <ReviewItem label="Type" value={formData.projectType} />
                                            <ReviewItem label="Target" value={`${formData.targetAmountSol} SOL`} />
                                            <ReviewItem label="Deadline" value={formData.deadline ? new Date(formData.deadline).toLocaleDateString() : "30 days"} />
                                            {formData.locationName && <ReviewItem label="Location" value={formData.locationName} />}
                                            {formData.hostName && <ReviewItem label="Host" value={formData.hostName} />}
                                            <ReviewItem label="Images" value={`${images.length} uploaded`} />
                                            <ReviewItem label="Video" value={formData.videoUrl ? "Yes" : "None"} />
                                        </div>
                                    </div>
                                    {imageUrls.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto">
                                            {imageUrls.map((url, i) => (
                                                <img key={i} src={url} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-10">
                        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all bg-[#14F195] text-black hover:bg-[#00FFA3] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,241,149,0.3)]">
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all bg-[#14F195] text-black hover:bg-[#00FFA3] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)]">
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Check className="w-4 h-4" /> Launch Campaign</>}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <style jsx global>{`
                .form-input {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 1rem;
                    padding: 1rem 1.5rem;
                    outline: none;
                    transition: border-color 0.2s;
                    color: white;
                }
                .form-input:focus {
                    border-color: #14F195;
                }
                .form-input option {
                    background: #1a1a1c;
                    color: white;
                }
            `}</style>
        </main>
    );
}

function Field({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-neutral-500">{label}</label>
            {sublabel && <p className="text-xs text-neutral-600">{sublabel}</p>}
            {children}
        </div>
    );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</div>
            <div className="font-bold capitalize">{value}</div>
        </div>
    );
}
