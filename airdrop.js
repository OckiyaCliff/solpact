const {
    Connection,
    PublicKey,
    clusterApiUrl,
    LAMPORTS_PER_SOL
} = require("@solana/web3.js");

const WALLET_ADDRESS = "9uWPELiCiZEEZP5mLgmupEC5XbbesKWoqkd5rmQvbYFc";
const publicKey = new PublicKey(WALLET_ADDRESS);

const getWalletBalance = async () => {
    try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const walletBalance = await connection.getBalance(publicKey);
        console.log(`Wallet balance is ${walletBalance / LAMPORTS_PER_SOL} SOL`);
        return walletBalance;
    } catch (err) {
        console.error("Error getting balance:", err);
    }
};

const airDropSol = async () => {
    try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        console.log(`Requesting airdrop for ${WALLET_ADDRESS}...`);
        const fromAirDropSignature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
        console.log("Airdrop requested, waiting for confirmation...");
        await connection.confirmTransaction(fromAirDropSignature);
        console.log("Confirmation received!");
    } catch (err) {
        console.log("Airdrop failed:", err.message);
    }
};

const main = async () => {
    await getWalletBalance();
    await airDropSol();
    await getWalletBalance();
};

main();
