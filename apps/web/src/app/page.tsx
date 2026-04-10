"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Heart } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Campaign } from "@/types";
import Link from "next/link";

export default function Home() {
  const campaigns = useQuery(api.campaigns.listActiveCampaigns, {});

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#9945FF] opacity-5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 max-w-4xl mx-auto">
              Empowering communities, <br />
              <span className="gradient-text">one pact at a time.</span>
            </h1>
            <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              SolPact is a transparent, Solana-native crowdfunding platform tailored for Nigerian projects.
              Pure trust, trustless custody, and real-world impact.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/create" className="bg-[#14F195] text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-[#00FFA3] transition-all group">
                Start a Campaign
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/explore" className="glass px-8 py-4 rounded-full font-bold text-lg hover:bg-white/5 transition-all">
                Browse Projects
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-[#14F195]" />}
            title="Trustless Custody"
            description="Funds are held in secure Solana PDAs. Released only when project milestones are verified by our community."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-[#9945FF]" />}
            title="Instant Settle"
            description="Solana's high-speed network ensures your donations reaching the target in seconds with near-zero fees."
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-pink-500" />}
            title="Real-World Impact"
            description="Track every Naira. From water projects to education, see the direct impact of your SOL contributions."
          />
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Featured Campaigns</h2>
              <p className="text-neutral-400">Join these active projects making a difference.</p>
            </div>
            <Link href="/explore" className="text-[#14F195] font-semibold flex items-center gap-2 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaigns === undefined ? (
              [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            ) : campaigns.length === 0 ? (
              <div className="col-span-3 text-center py-20 glass rounded-3xl">
                <p className="text-neutral-400">No active campaigns found. Be the first to create one!</p>
              </div>
            ) : (
              campaigns.slice(0, 3).map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-3xl hover:bg-white/5 transition-colors">
      <div className="mb-6 p-4 bg-white/5 rounded-2xl">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </div>
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
