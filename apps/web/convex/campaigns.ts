import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createCampaign = mutation({
    args: {
        hostId: v.string(), // walletAddress
        title: v.string(),
        description: v.string(),
        category: v.string(),
        projectType: v.string(),
        targetAmountLamports: v.float64(),
        targetAmountNgn: v.optional(v.float64()),
        deadline: v.number(),
        locationLat: v.optional(v.float64()),
        locationLng: v.optional(v.float64()),
        locationName: v.optional(v.string()),
        verifierId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("campaigns", {
            ...args,
            raisedAmountLamports: 0,
            state: "created",
            createdAt: Date.now(),
        });
    },
});

export const updateCampaignOnChain = mutation({
    args: {
        campaignId: v.id("campaigns"),
        onChainAddress: v.string(),
        state: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.campaignId, {
            onChainAddress: args.onChainAddress,
            state: args.state,
        });
    },
});

export const updateCampaignState = mutation({
    args: {
        campaignId: v.id("campaigns"),
        state: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.campaignId, { state: args.state });
    },
});

export const listActiveCampaigns = query({
    args: {
        projectType: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("campaigns").withIndex("by_state", (q) => q.eq("state", "active"));

        if (args.projectType) {
            q = q.filter((q) => q.eq(q.field("projectType"), args.projectType));
        }

        if (args.category) {
            q = q.filter((q) => q.eq(q.field("category"), args.category));
        }

        return await q.order("desc").collect();
    },
});

export const getCampaign = query({
    args: { campaignId: v.id("campaigns") },
    handler: async (ctx, args) => {
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) return null;

        const donations = await ctx.db
            .query("donations")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .collect();

        return { ...campaign, donationCount: donations.length };
    },
});

export const getMyCampaigns = query({
    args: { hostId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("campaigns")
            .withIndex("by_host", (q) => q.eq("hostId", args.hostId))
            .order("desc")
            .collect();
    },
});
