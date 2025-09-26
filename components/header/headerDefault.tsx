import {MaterialCommunityIcons} from "@expo/vector-icons";
import {Colors} from "@/constants/theme";
import {ThemedText} from "@/components/themed-text";
import {router} from "expo-router";
import {TouchableOpacity, View, StyleSheet} from "react-native";

type HeaderDefaultProps = {
    title: string;
};

export function HeaderDefault({title}: HeaderDefaultProps) {
    return (
        <>
            {/* Header */}
            <View style={styles.headerRow}>
                {/* Back button */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.dark.tint} />
                </TouchableOpacity>

                {/* Title */}
                <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                    {title}
                </ThemedText>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 22,
        textAlign: "center",
        color: Colors.dark.text,
    },
    backButton: {
        padding: 4,
        marginRight: 10,
    },
});