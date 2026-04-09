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
        return await ctx.db
            .query("verifications")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("desc")
            .collect();
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
