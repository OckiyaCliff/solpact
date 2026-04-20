import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/hooks/useWallet";
import { useSolanaProgram } from "@/hooks/useSolanaProgram";
import { MapPin, Globe, CreditCard, X, CheckCircle } from "lucide-react-native";
import { PublicKey } from "@solana/web3.js";
import { formatSol, formatNgn, getNgnToSol } from "@/utils/fx";

export default function CampaignDetailScreen() {
    const { id } = useLocalSearchParams();
    const campaign = useQuery(api.campaigns.getCampaign, { campaignId: id as any });
    const [donateModalVisible, setDonateModalVisible] = useState(false);
    const [amountNgn, setAmountNgn] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const { publicKey, connect } = useWallet();
    const { donateTx } = useSolanaProgram();
    const recordDonation = useMutation(api.donations.recordDonation);

    if (!campaign) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#14F195" />
            </View>
        );
    }

    const handleDonate = async () => {
        if (!amountNgn) return;
        if (!publicKey) {
            const account = await connect();
            if (!account) return;
        }

        setIsProcessing(true);
        try {
            const solAmount = await getNgnToSol(parseFloat(amountNgn));
            const lamports = Math.floor(solAmount * 1e9);

            // 1. Solana Transaction (mock)
            const txSig = await donateTx(new PublicKey(campaign.onChainAddress || publicKey!.toBase58()), lamports);

            // 2. Record in Convex
            await recordDonation({
                campaignId: campaign._id,
                donorId: publicKey!.toBase58(),
                amountLamports: lamports,
                txSignature: txSig,
            });

            setDonateModalVisible(false);
            setAmountNgn("");
            Alert.alert("Awesome!", `You donated ${formatNgn(parseFloat(amountNgn))} to this project.`);
        } catch (error: any) {
            Alert.alert("Donation Failed", error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const progress = Math.min((campaign.raisedAmountLamports / campaign.targetAmountLamports) * 100, 100);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.mediaPlaceholder}>
                <Text style={styles.mediaText}>Project Images / Video</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.typeBadge}>
                        {campaign.projectType === "offline" ? <MapPin size={16} color="#666" /> : <Globe size={16} color="#666" />}
                        <Text style={styles.typeText}>{campaign.projectType.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.categoryText}>{campaign.category}</Text>
                </View>

                <Text style={styles.title}>{campaign.title}</Text>
                <Text style={styles.hostText}>Hosted by {campaign.hostId.slice(0, 8)}...</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{formatSol(campaign.raisedAmountLamports)}</Text>
                        <Text style={styles.statLabel}>Raised</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{formatSol(campaign.targetAmountLamports)}</Text>
                        <Text style={styles.statLabel}>Goal</Text>
                    </View>
                </View>

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}% of goal reached</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About this project</Text>
                    <Text style={styles.description}>{campaign.description}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.donateButton} onPress={() => setDonateModalVisible(true)}>
                    <CreditCard color="#fff" size={24} />
                    <Text style={styles.donateButtonText}>Back Project</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={donateModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Enter Amount</Text>
                            <TouchableOpacity onPress={() => setDonateModalVisible(false)}>
                                <X color="#000" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.currencyPrefix}>₦</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0"
                                keyboardType="numeric"
                                autoFocus
                                value={amountNgn}
                                onChangeText={setAmountNgn}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmButton, isProcessing && styles.buttonDisabled]}
                            onPress={handleDonate}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Confirm Donation</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    mediaPlaceholder: { height: 250, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" },
    mediaText: { color: "#ccc", fontSize: 18, fontWeight: "600" },
    content: { padding: 24 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    typeBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", padding: 6, borderRadius: 8, gap: 4 },
    typeText: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
    categoryText: { fontSize: 14, fontWeight: "600", color: "#3B82F6", textTransform: "capitalize" },
    title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 8 },
    hostText: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
    statsContainer: { flexDirection: "row", gap: 32, marginBottom: 16 },
    statBox: { flex: 1 },
    statValue: { fontSize: 18, fontWeight: "800", color: "#111827" },
    statLabel: { fontSize: 12, color: "#6B7280", marginTop: 4 },
    progressBar: { height: 12, backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden", marginBottom: 12 },
    progressFill: { height: "100%", backgroundColor: "#14F195" },
    progressText: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 32 },
    section: { marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 12 },
    description: { fontSize: 16, color: "#374151", lineHeight: 24, marginBottom: 100 },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
    donateButton: { backgroundColor: "#111827", padding: 18, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
    donateButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
    modalTitle: { fontSize: 20, fontWeight: "800" },
    inputContainer: { flexDirection: "row", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#14F195", marginBottom: 40 },
    currencyPrefix: { fontSize: 32, fontWeight: "700", marginRight: 8 },
    amountInput: { flex: 1, fontSize: 32, fontWeight: "700", paddingVertical: 12 },
    confirmButton: { backgroundColor: "#14F195", padding: 18, borderRadius: 16, alignItems: "center" },
    confirmButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
    buttonDisabled: { opacity: 0.5 },
});
