import { useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet } from "./useWallet";

// Program ID from lib.rs
export const PROGRAM_ID = new PublicKey("2gCZPc24gWVsxzzaudiYydjQrrMu54cCFo4ZSqtkgoc4");

export function useSolanaProgram() {
    const { connection, publicKey, signAndSendTransaction } = useWallet();

    const createCampaignTx = async (args: {
        campaignId: number[];
        targetAmount: number;
        deadline: number;
        projectType: number;
        category: number[];
        verifier: PublicKey;
    }) => {
        if (!publicKey) throw new Error("Wallet not connected");

        // Derived PDA for the campaign
        const [campaignPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("campaign"), publicKey.toBuffer(), Buffer.from(args.campaignId)],
            PROGRAM_ID
        );

        // Derived PDA for the vault
        const [vaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), campaignPda.toBuffer()],
            PROGRAM_ID
        );

        console.log("Building createCampaign tx for PDA:", campaignPda.toBase58());

        // TODO: Wire to real Anchor IDL when deployed to devnet/mainnet
        // const program = new anchor.Program(IDL, PROGRAM_ID, provider);
        // const tx = await program.methods.createCampaign(
        //     args.campaignId, new anchor.BN(args.targetAmount),
        //     new anchor.BN(args.deadline), args.projectType, args.category
        // ).accounts({ campaign: campaignPda, vault: vaultPda, host: publicKey, ... })
        // .transaction();
        // return await signAndSendTransaction(tx);

        return `mock_create_${Date.now()}`;
    };

    const donateTx = async (campaignAddress: PublicKey, amount: number) => {
        if (!publicKey) throw new Error("Wallet not connected");

        const [vaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), campaignAddress.toBuffer()],
            PROGRAM_ID
        );

        console.log("Building donate tx to vault:", vaultPda.toBase58());

        // TODO: Wire to real Anchor IDL when deployed
        // const tx = await program.methods.donate(new anchor.BN(amount))
        //   .accounts({ campaign: campaignAddress, vault: vaultPda, donor: publicKey, ... })
        //   .transaction();
        // return await signAndSendTransaction(tx);

        return `mock_donate_${Date.now()}`;
    };

    return {
        createCampaignTx,
        donateTx,
        publicKey,
        PROGRAM_ID,
    };
}
