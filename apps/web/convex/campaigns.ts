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
        // New fields
        images: v.optional(v.array(v.id("_storage"))),
        videoUrl: v.optional(v.string()),
        hostName: v.optional(v.string()),
        hostEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("campaigns", {
            ...args,
            raisedAmountLamports: 0,
            state: "active",
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

        const results = await q.order("desc").collect();
        // Filter out suspended campaigns
        return results.filter((c) => !c.isSuspended);
    },
});

export const listAllCampaigns = query({
    args: {
        projectType: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let results = await ctx.db.query("campaigns").order("desc").collect();

        // Filter out suspended campaigns from public view
        results = results.filter((c) => !c.isSuspended);

        if (args.projectType) {
            results = results.filter((c) => c.projectType === args.projectType);
        }
        if (args.category) {
            results = results.filter((c) => c.category === args.category);
        }

        return results;
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

        // Resolve image URLs
        const imageUrls: string[] = [];
        if (campaign.images) {
            for (const storageId of campaign.images) {
                const url = await ctx.storage.getUrl(storageId);
                if (url) imageUrls.push(url);
            }
        }

        return {
            ...campaign,
            donationCount: donations.length,
            donations: donations,
            imageUrls,
        };
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

// Generate an upload URL for Convex file storage
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// Get a signed URL for a storage file
export const getImageUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

// Get image URLs for a campaign (for card previews)
export const getCampaignImageUrls = query({
    args: { campaignId: v.id("campaigns") },
    handler: async (ctx, args) => {
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign || !campaign.images || campaign.images.length === 0) return [];

        const urls: string[] = [];
        for (const storageId of campaign.images) {
            const url = await ctx.storage.getUrl(storageId);
            if (url) urls.push(url);
        }
        return urls;
    },
});
