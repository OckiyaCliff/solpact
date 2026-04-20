import { useCallback, useMemo, useState } from "react";
import {
    transact,
    Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
    Connection,
    PublicKey,
    Transaction,
    Cluster,
    clusterApiUrl,
} from "@solana/web3.js";
import { Alert } from "react-native";

export const APP_IDENTITY = {
    name: "SolPact",
    uri: "https://solpact.io",
    icon: "icon.png",
};

export function useWallet() {
    const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
    const connection = useMemo(
        () => new Connection(clusterApiUrl("devnet"), "confirmed"),
        []
    );

    const connect = useCallback(async () => {
        try {
            const result = await transact(async (wallet: Web3MobileWallet) => {
                const authorizeResult = await wallet.authorize({
                    cluster: "devnet",
                    identity: APP_IDENTITY,
                });
                return authorizeResult;
            });
            setSelectedAccount(result.accounts[0]);
            return result.accounts[0];
        } catch (error: any) {
            console.error("Wallet connection error:", error);
            Alert.alert("Connection Error", error.message || "Failed to connect wallet");
        }
    }, []);

    const disconnect = useCallback(() => {
        setSelectedAccount(null);
    }, []);

    const signAndSendTransaction = useCallback(
        async (transaction: Transaction) => {
            if (!selectedAccount) throw new Error("Wallet not connected");

            try {
                return await transact(async (wallet: Web3MobileWallet) => {
                    await wallet.reauthorize({
                        auth_token: selectedAccount.auth_token,
                        identity: APP_IDENTITY,
                    });

                    const signatures = await wallet.signAndSendTransactions({
                        transactions: [transaction],
                    });
                    return signatures[0];
                });
            } catch (error: any) {
                console.error("Transaction error:", error);
                Alert.alert("Transaction Failed", error.message || "Unknown error");
                throw error;
            }
        },
        [selectedAccount]
    );

    return {
        selectedAccount,
        publicKey: selectedAccount ? new PublicKey(selectedAccount.address) : null,
        connect,
        disconnect,
        signAndSendTransaction,
        connection,
    };
}
