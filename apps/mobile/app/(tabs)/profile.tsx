import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/hooks/useWallet";
import { User, Wallet, LogOut, History, ShieldCheck } from "lucide-react-native";

export default function ProfileScreen() {
    const { publicKey, connect, disconnect, selectedAccount } = useWallet();
    const myCampaigns = useQuery(api.campaigns.getMyCampaigns, {
        hostId: publicKey?.toBase58() || "",
    });

    const renderNotConnected = () => (
        <View style={styles.content}>
            <View style={styles.profileHeader}>
                <View style={styles.avatarPlaceholder}>
                    <User size={48} color="#9CA3AF" />
                </View>
                <Text style={styles.userName}>Guest User</Text>
                <Text style={styles.userRole}>Connect your wallet to start building</Text>
            </View>

            <TouchableOpacity style={styles.connectButton} onPress={connect}>
                <Wallet color="#fff" size={20} />
                <Text style={styles.connectButtonText}>Connect Solana Wallet</Text>
            </TouchableOpacity>
        </View>
    );

    const renderConnected = () => (
        <ScrollView style={styles.content}>
            <View style={styles.profileHeader}>
                <View style={styles.avatarPlaceholder}>
                    <User size={48} color="#14F195" />
                </View>
                <Text style={styles.userName}>{publicKey?.toBase58().slice(0, 8)}...</Text>
                <View style={styles.walletBadge}>
                    <Text style={styles.walletAddress}>{publicKey?.toBase58()}</Text>
                </View>
            </View>

            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>My Activity</Text>
                <TouchableOpacity style={styles.menuItem}>
                    <History size={20} color="#374151" />
                    <Text style={styles.menuText}>My Campaigns ({myCampaigns?.length || 0})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <ShieldCheck size={20} color="#374151" />
                    <Text style={styles.menuText}>Verifications</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={disconnect}>
                <LogOut color="#EF4444" size={20} />
                <Text style={styles.logoutText}>Disconnect Wallet</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return <SafeAreaView style={styles.container}>{publicKey ? renderConnected() : renderNotConnected()}</SafeAreaView>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    content: { padding: 24, alignItems: "center" },
    profileHeader: { alignItems: "center", marginBottom: 32, marginTop: 20 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 16 },
    userName: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 4 },
    userRole: { fontSize: 14, color: "#6B7280" },
    walletBadge: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
    walletAddress: { fontSize: 12, color: "#6B7280", fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
    connectButton: { backgroundColor: "#111827", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 },
    connectButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    menuSection: { width: "100%", backgroundColor: "#fff", borderRadius: 20, padding: 8, marginBottom: 32 },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", margin: 16 },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    menuText: { fontSize: 16, fontWeight: "600", color: "#374151" },
    logoutButton: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    logoutText: { color: "#EF4444", fontSize: 16, fontWeight: "700" },
});
