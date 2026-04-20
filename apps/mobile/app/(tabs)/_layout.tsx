import { Tabs } from "expo-router";
import { Home, Compass, PlusSquare, User } from "lucide-react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#14F195", // Solana Green
                tabBarInactiveTintColor: "#555",
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "SolPact",
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explore",
                    tabBarIcon: ({ color }) => <Compass color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: "Launch",
                    tabBarIcon: ({ color }) => <PlusSquare color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <User color={color} size={24} />,
                }}
            />
        </Tabs>
    );
}
