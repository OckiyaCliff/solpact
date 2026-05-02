import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        walletAddress: v.string(), // Solana pubkey
        displayName: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.string(), // "host", "backer", "verifier", "admin"
        avatarUrl: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_wallet", ["walletAddress"]),

    campaigns: defineTable({
        hostId: v.string(), // walletAddress of the host
        title: v.string(),
        description: v.string(),
        category: v.string(), // "borehole", "school", "website", etc.
        projectType: v.string(), // "offline", "online"
        targetAmountLamports: v.float64(),
        targetAmountNgn: v.optional(v.float64()),
        raisedAmountLamports: v.float64(),
        deadline: v.number(), // timestamp
        state: v.string(), // "created", "active", "funded", "disbursed", "expired"
        locationLat: v.optional(v.float64()),
        locationLng: v.optional(v.float64()),
        locationName: v.optional(v.string()),
        metadataUri: v.optional(v.string()), // IPFS CID
        onChainAddress: v.optional(v.string()), // Campaign PDA pubkey
        verifierId: v.optional(v.string()), // preferred verifier wallet
        createdAt: v.number(),
        // New fields for rich campaigns
        images: v.optional(v.array(v.id("_storage"))), // Convex storage IDs for uploaded images
        videoUrl: v.optional(v.string()), // YouTube/Vimeo embed URL
        hostName: v.optional(v.string()), // Display name of campaign creator
        hostEmail: v.optional(v.string()), // Contact email for campaign host
        // Admin moderation
        isSuspended: v.optional(v.boolean()), // Admin flag to hide campaigns
        suspendedReason: v.optional(v.string()), // Reason for suspension
        suspendedAt: v.optional(v.number()), // Timestamp of suspension
        suspendedBy: v.optional(v.string()), // Admin wallet who suspended
    })
        .index("by_host", ["hostId"])
        .index("by_state", ["state"])
        .index("by_type", ["projectType"]),

    donations: defineTable({
        campaignId: v.id("campaigns"),
        donorId: v.string(), // walletAddress of donor
        amountLamports: v.float64(),
        txSignature: v.string(),
        createdAt: v.number(),
    })
        .index("by_campaign", ["campaignId"])
        .index("by_donor", ["donorId"]),

    verifications: defineTable({
        campaignId: v.id("campaigns"),
        verifierId: v.string(), // walletAddress of verifier
        proofUrls: v.array(v.string()),
        proofCid: v.optional(v.string()),
        status: v.string(), // "pending", "approved", "rejected"
        notes: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_campaign", ["campaignId"]),

    proofUploads: defineTable({
        campaignId: v.id("campaigns"),
        uploaderId: v.string(), // walletAddress of collector/host
        fileUrl: v.string(),
        fileType: v.string(),
        gpsLat: v.optional(v.float64()),
        gpsLng: v.optional(v.float64()),
        createdAt: v.number(),
    }).index("by_campaign", ["campaignId"]),
});
