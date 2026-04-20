import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWallet } from "@/hooks/useWallet";
import { useSolanaProgram } from "@/hooks/useSolanaProgram";
import { MapPin, Globe, ChevronRight, CheckCircle2 } from "lucide-react-native";
import { router } from "expo-router";

export default function CreateCampaignScreen() {
    const [step, setStep] = useState(1);
    const [projectType, setProjectType] = useState<"offline" | "online" | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        targetAmountNgn: "",
        deadlineDays: "30",
    });

    const { publicKey, connect } = useWallet();
    const { createCampaignTx } = useSolanaProgram();
    const createCampaignConvex = useMutation(api.campaigns.createCampaign);

    const handleLaunch = async () => {
        if (!projectType) return;
        if (!publicKey) {
            const account = await connect();
            if (!account) return;
        }

        try {
            const lamports = parseFloat(formData.targetAmountNgn) * 1000; // Mock conversion
            const deadline = Math.floor(Date.now() / 1000) + parseInt(formData.deadlineDays) * 86400;

            // 1. Create on-chain (mock for now)
            const txSig = await createCampaignTx({
                campaignId: Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)),
                targetAmount: lamports,
                deadline,
                projectType: projectType === "offline" ? 0 : 1,
                category: Array.from({ length: 32 }, (_, i) => formData.category.charCodeAt(i) || 0),
                verifier: publicKey!, // Placeholder
            });

            // 2. Save to Convex
            await createCampaignConvex({
                hostId: publicKey!.toBase58(),
                title: formData.title,
                description: formData.description,
                category: formData.category.toLowerCase(),
                projectType,
                targetAmountLamports: lamports,
                targetAmountNgn: parseFloat(formData.targetAmountNgn),
                deadline,
            });

            Alert.alert("Success", "Campaign launched successfully!", [
                { text: "View Details", onPress: () => router.push("/") },
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to launch campaign");
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What kind of project are you building?</Text>
            <TouchableOpacity
                style={[styles.typeCard, projectType === "offline" && styles.typeCardActive]}
                onPress={() => setProjectType("offline")}
            >
                <MapPin size={32} color={projectType === "offline" ? "#14F195" : "#6B7280"} />
                <View>
                    <Text style={styles.typeLabel}>Offline / Real-World</Text>
                    <Text style={styles.typeDesc}>Boreholes, schools, clinics, local infra.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.typeCard, projectType === "online" && styles.typeCardActive]}
                onPress={() => setProjectType("online")}
            >
                <Globe size={32} color={projectType === "online" ? "#14F195" : "#6B7280"} />
                <View>
                    <Text style={styles.typeLabel}>Online / Digital</Text>
                    <Text style={styles.typeDesc}>Apps, courses, NFT tools, open source.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                disabled={!projectType}
                style={[styles.nextButton, !projectType && styles.buttonDisabled]}
                onPress={() => setStep(2)}
            >
                <Text style={styles.nextButtonText}>Continue</Text>
                <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tell us more about the project</Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Lagos Community Borehole"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the impact and how the funds will be used..."
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Water, Education, Software"
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
            />

            <Text style={styles.inputLabel}>Target Amount (Naira)</Text>
            <TextInput
                style={styles.input}
                placeholder="500,000"
                keyboardType="numeric"
                value={formData.targetAmountNgn}
                onChangeText={(text) => setFormData({ ...formData, targetAmountNgn: text })}
            />

            <TouchableOpacity style={styles.launchButton} onPress={handleLaunch}>
                <CheckCircle2 color="#fff" size={20} />
                <Text style={styles.launchButtonText}>Launch Campaign</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.progressBar}>
                <View style={[styles.progressIndicator, { width: `${(step / 2) * 100}%` }]} />
            </View>
            {step === 1 ? renderStep1() : renderStep2()}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    progressBar: {
        height: 4,
        backgroundColor: "#F3F4F6",
    },
    progressIndicator: {
        height: "100%",
        backgroundColor: "#14F195",
    },
    stepContainer: {
        padding: 24,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 32,
    },
    typeCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#F3F4F6",
        marginBottom: 16,
        gap: 16,
    },
    typeCardActive: {
        borderColor: "#14F195",
        backgroundColor: "#F0FDF4",
    },
    typeLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    typeDesc: {
        fontSize: 14,
        color: "#6B7280",
    },
    nextButton: {
        backgroundColor: "#111827",
        padding: 16,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    nextButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: "#F9FAFB",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        fontSize: 16,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    launchButton: {
        backgroundColor: "#14F195",
        padding: 18,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 32,
        marginBottom: 40,
        gap: 8,
    },
    launchButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
    },
});
