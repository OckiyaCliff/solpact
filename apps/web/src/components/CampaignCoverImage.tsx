"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Fetches and displays the first image of a campaign from Convex storage.
 * Falls back to a gradient placeholder with the campaign's first letter.
 */
export default function CampaignCoverImage({
    campaignId,
    title,
    className = "",
}: {
    campaignId: string;
    title: string;
    className?: string;
}) {
    const imageUrls = useQuery(api.campaigns.getCampaignImageUrls, {
        campaignId: campaignId as Id<"campaigns">,
    });

    if (imageUrls && imageUrls.length > 0) {
        return (
            <img
                src={imageUrls[0]}
                alt={title}
                className={`w-full h-full object-cover ${className}`}
            />
        );
    }

    // Placeholder with gradient
    return (
        <div
            className={`w-full h-full bg-gradient-to-br from-[#14F195]/15 to-[#9945FF]/15 flex items-center justify-center ${className}`}
        >
            <span className="text-4xl font-black text-white/20">
                {title.charAt(0).toUpperCase()}
            </span>
        </div>
    );
}
