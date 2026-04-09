import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
    args: {
        walletAddress: v.string(),
        displayName: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.string(),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
            .unique();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                displayName: args.displayName ?? existingUser.displayName,
                email: args.email ?? existingUser.email,
                phone: args.phone ?? existingUser.phone,
                role: args.role ?? existingUser.role,
                avatarUrl: args.avatarUrl ?? existingUser.avatarUrl,
            });
            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            walletAddress: args.walletAddress,
            displayName: args.displayName || "Anonymous",
            email: args.email,
            phone: args.phone,
            role: args.role,
            avatarUrl: args.avatarUrl,
            createdAt: Date.now(),
        });
    },
});

export const getByWallet = query({
    args: { walletAddress: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
            .unique();
    },
});

export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
