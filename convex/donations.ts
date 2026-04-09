import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const recordDonation = mutation({
    args: {
        campaignId: v.id("campaigns"),
        donorId: v.string(), // walletAddress
        amountLamports: v.float64(),
        txSignature: v.string(),
    },
    handler: async (ctx, args) => {
        // Record the donation
        const donationId = await ctx.db.insert("donations", {
            ...args,
            createdAt: Date.now(),
        });

        // Update campaign raised amount
        const campaign = await ctx.db.get(args.campaignId);
        if (campaign) {
            await ctx.db.patch(args.campaignId, {
                raisedAmountLamports: campaign.raisedAmountLamports + args.amountLamports,
            });
        }

        return donationId;
    },
});

export const getDonationsByCampaign = query({
    args: { campaignId: v.id("campaigns") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("donations")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .order("desc")
            .collect();
    },
});

export const getDonationsByUser = query({
    args: { donorId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("donations")
            .withIndex("by_donor", (q) => q.eq("donorId", args.donorId))
            .order("desc")
            .collect();
    },
});
