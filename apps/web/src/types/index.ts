import { Id } from "../../convex/_generated/dataModel";

export interface Campaign {
    _id: string;
    _creationTime: number;
    hostId: string;
    title: string;
    description: string;
    category: string;
    projectType: string;
    targetAmountLamports: number;
    targetAmountNgn?: number;
    raisedAmountLamports: number;
    deadline: number;
    state: string;
    locationLat?: number;
    locationLng?: number;
    locationName?: string;
    metadataUri?: string;
    onChainAddress?: string;
    verifierId?: string;
    createdAt: number;
    // Rich media
    images?: Id<"_storage">[];
    videoUrl?: string;
    hostName?: string;
    hostEmail?: string;
    // Admin moderation
    isSuspended?: boolean;
    suspendedReason?: string;
    suspendedAt?: number;
    suspendedBy?: string;
}

export interface CampaignWithDetails extends Campaign {
    donationCount: number;
    donations: Donation[];
    imageUrls: string[];
}

export interface CampaignWithCover extends Campaign {
    coverImageUrl?: string | null;
}

export interface Donation {
    _id: string;
    _creationTime: number;
    campaignId: string;
    donorId: string;
    amountLamports: number;
    txSignature: string;
    createdAt: number;
}

export interface User {
    _id: string;
    _creationTime: number;
    walletAddress: string;
    displayName?: string;
    email?: string;
    phone?: string;
    role: string;
    avatarUrl?: string;
    createdAt: number;
}

export interface AdminStats {
    totalCampaigns: number;
    activeCampaigns: number;
    suspendedCampaigns: number;
    totalDonations: number;
    totalRaisedLamports: number;
    totalRaisedSol: number;
    totalUsers: number;
}
