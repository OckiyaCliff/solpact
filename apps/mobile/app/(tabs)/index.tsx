import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, SlidersHorizontal, MapPin, Globe } from "lucide-react-native";

const CATEGORIES = ["All", "Borehole", "School", "Clinic", "App", "Course"];

export default function HomeScreen() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const campaigns = useQuery(api.campaigns.listActiveCampaigns, {
        category: selectedCategory === "All" ? undefined : selectedCategory.toLowerCase(),
    });

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Welcome to</Text>
                <Text style={styles.logoText}>SolPact</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
                <Search color="#000" size={24} />
            </TouchableOpacity>
        </View>
    );

    const renderCategories = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
        >
            {CATEGORIES.map((cat) => (
                <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                        styles.categoryPill,
                        selectedCategory === cat && styles.categoryPillActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.categoryText,
                            selectedCategory === cat && styles.categoryTextActive,
                        ]}
                    >
                        {cat}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderCategories()}

            <FlatList
                data={campaigns}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.typeBadge}>
                                {item.projectType === "offline" ? (
                                    <MapPin size={14} color="#666" />
                                ) : (
                                    <Globe size={14} color="#666" />
                                )}
                                <Text style={styles.typeText}>
                                    {item.projectType.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.stateBadge}>{item.category}</Text>
                        </View>

                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDescription} numberOfLines={2}>
                            {item.description}
                        </Text>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.min(
                                                (item.raisedAmountLamports / item.targetAmountLamports) * 100,
                                                100
                                            )}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <View style={styles.progressStats}>
                                <Text style={styles.raisedText}>
                                    {item.raisedAmountLamports / 1e9} SOL raised
                                </Text>
                                <Text style={styles.goalText}>
                                    {Math.round(
                                        (item.raisedAmountLamports / item.targetAmountLamports) * 100
                                    )}%
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No campaigns found in this category.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    greeting: {
        fontSize: 16,
        color: "#6B7280",
        fontWeight: "500",
    },
    logoText: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
    },
    iconButton: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categoryContainer: {
        maxHeight: 50,
        marginVertical: 10,
        paddingLeft: 20,
    },
    categoryPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#fff",
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    categoryPillActive: {
        backgroundColor: "#14F195", // Solana Green
        borderColor: "#14F195",
    },
    categoryText: {
        color: "#374151",
        fontWeight: "600",
    },
    categoryTextActive: {
        color: "#fff",
    },
    listContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    typeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#6B7280",
    },
    stateBadge: {
        fontSize: 12,
        fontWeight: "600",
        color: "#3B82F6",
        textTransform: "capitalize",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
        marginBottom: 16,
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#14F195",
    },
    progressStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    raisedText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#111827",
    },
    goalText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#14F195",
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        color: "#9CA3AF",
        fontSize: 16,
    },
});
