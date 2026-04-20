import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitVerification = mutation({
    args: {
        campaignId: v.id("campaigns"),
        verifierId: v.string(), // walletAddress
        proofUrls: v.array(v.string()),
        proofCid: v.optional(v.string()),
        status: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const verificationId = await ctx.db.insert("verifications", {
            ...args,
            createdAt: Date.now(),
        });

        // If approved, update campaign state
        if (args.status === "approved") {
            await ctx.db.patch(args.campaignId, { state: "funded" });
        }

        return verificationId;
    },
});

export const getVerificationQueue = query({
    handler: async (ctx) => {
        const verifications = await ctx.db
            .query("verifications")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("desc")
            .collect();

        const results = [];
        for (const verification of verifications) {
            const campaign = await ctx.db.get(verification.campaignId);
            if (campaign) {
                results.push({
                    ...verification,
                    campaign,
                });
            }
        }
        return results;
    },
});

export const getVerificationByCampaign = query({
    args: { campaignId: v.id("campaigns") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("verifications")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .order("desc")
            .first();
    },
});

export const uploadProof = mutation({
    args: {
        campaignId: v.id("campaigns"),
        uploaderId: v.string(),
        fileUrl: v.string(),
        fileType: v.string(),
        gpsLat: v.optional(v.float64()),
        gpsLng: v.optional(v.float64()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("proofUploads", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

export const getProofsByCampaign = query({
    args: { campaignId: v.id("campaigns") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("proofUploads")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .order("desc")
            .collect();
    },
});
export const getVerifierStats = query({
    handler: async (ctx) => {
        const pending = await ctx.db
            .query("verifications")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const verifiedToday = await ctx.db
            .query("verifications")
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "approved"),
                    q.gt(q.field("createdAt"), startOfDay)
                )
            )
            .collect();

        const activeCampaigns = await ctx.db
            .query("campaigns")
            .withIndex("by_state", (q) => q.eq("state", "active"))
            .collect();

        return {
            pendingReview: pending.length,
            verifiedToday: verifiedToday.length,
            needsProof: activeCampaigns.length,
        };
    },
});
