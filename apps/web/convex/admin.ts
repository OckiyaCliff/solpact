import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Admin: Suspend a campaign (hides from public view)
export const suspendCampaign = mutation({
    args: {
        campaignId: v.id("campaigns"),
        reason: v.string(),
        adminWallet: v.string(),
    },
    handler: async (ctx, args) => {
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");

        await ctx.db.patch(args.campaignId, {
            isSuspended: true,
            suspendedReason: args.reason,
            suspendedAt: Date.now(),
            suspendedBy: args.adminWallet,
        });
    },
});

// Admin: Unsuspend a campaign
export const unsuspendCampaign = mutation({
    args: {
        campaignId: v.id("campaigns"),
    },
    handler: async (ctx, args) => {
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");

        await ctx.db.patch(args.campaignId, {
            isSuspended: false,
            suspendedReason: undefined,
            suspendedAt: undefined,
            suspendedBy: undefined,
        });
    },
});

// Admin: Delete a campaign permanently
export const deleteCampaign = mutation({
    args: {
        campaignId: v.id("campaigns"),
    },
    handler: async (ctx, args) => {
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");

        // Delete associated images from storage
        if (campaign.images) {
            for (const storageId of campaign.images) {
                await ctx.storage.delete(storageId);
            }
        }

        // Delete associated donations
        const donations = await ctx.db
            .query("donations")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .collect();
        for (const donation of donations) {
            await ctx.db.delete(donation._id);
        }

        // Delete associated verifications
        const verifications = await ctx.db
            .query("verifications")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .collect();
        for (const verification of verifications) {
            await ctx.db.delete(verification._id);
        }

        // Delete associated proof uploads
        const proofs = await ctx.db
            .query("proofUploads")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .collect();
        for (const proof of proofs) {
            await ctx.db.delete(proof._id);
        }

        // Delete the campaign itself
        await ctx.db.delete(args.campaignId);
    },
});

// Admin: Get ALL campaigns including suspended ones
export const getAllCampaignsAdmin = query({
    args: {},
    handler: async (ctx) => {
        const campaigns = await ctx.db.query("campaigns").order("desc").collect();

        // Resolve first image URL for each campaign
        const results = [];
        for (const campaign of campaigns) {
            let coverImageUrl: string | null = null;
            if (campaign.images && campaign.images.length > 0) {
                coverImageUrl = await ctx.storage.getUrl(campaign.images[0]);
            }
            results.push({ ...campaign, coverImageUrl });
        }
        return results;
    },
});

// Admin: Get platform-wide statistics
export const getAdminStats = query({
    args: {},
    handler: async (ctx) => {
        const allCampaigns = await ctx.db.query("campaigns").collect();
        const allDonations = await ctx.db.query("donations").collect();
        const allUsers = await ctx.db.query("users").collect();

        const totalRaisedLamports = allCampaigns.reduce(
            (sum, c) => sum + c.raisedAmountLamports,
            0
        );
        const suspendedCampaigns = allCampaigns.filter((c) => c.isSuspended);
        const activeCampaigns = allCampaigns.filter(
            (c) => c.state === "active" && !c.isSuspended
        );

        return {
            totalCampaigns: allCampaigns.length,
            activeCampaigns: activeCampaigns.length,
            suspendedCampaigns: suspendedCampaigns.length,
            totalDonations: allDonations.length,
            totalRaisedLamports,
            totalRaisedSol: totalRaisedLamports / 1e9,
            totalUsers: allUsers.length,
        };
    },
});

// Admin: List all users
export const listAllUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").order("desc").collect();
    },
});
