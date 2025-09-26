import {useEffect, useState} from "react";
import {
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { MaterialIcons } from "@expo/vector-icons";
import {ExerciseWithSets} from "@/types/exercise";
import {Colors} from "@/constants/theme";
import { Image } from "expo-image";

type ExerciseCardProps = {
    item: ExerciseWithSets;
    editMode: boolean;
    updateSet: (exerciseId: string, setIndex: number, field: "reps" | "kgs", value: string) => void;
    addSet: (exerciseId: string) => void;
    removeSet: (exerciseId: string) => void;
    onPress?: () => void; // e.g. navigate to exercise details
};

export function ExerciseCard({
                                 item,
                                 editMode,
                                 updateSet,
                                 addSet,
                                 removeSet,
                                 onPress,
                             }: ExerciseCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Auto-expand when entering edit mode
    useEffect(() => {
        if (editMode) {
            setExpanded(true);
        } else {
            setExpanded(false);
        }
    }, [editMode]);

    return (
        <View style={styles.exerciseContainer}>
            {/* Card top row */}
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Image
                    source={
                        item.image
                            ? { uri: item.image }
                            : require("@/assets/images/favicon.png")
                    }
                    style={styles.image}
                    autoplay={false}
                />
                <View style={styles.textContainer}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>
                </View>
            </TouchableOpacity>

            {/* Accordion toggle */}
            <TouchableOpacity
                style={styles.setsToggleRow}
                onPress={() => setExpanded((prev) => !prev)}
            >
                <ThemedText style={styles.setsToggleText}>Sets</ThemedText>
                <MaterialIcons
                    name={expanded ? "expand-less" : "expand-more"}
                    size={22}
                    color={Colors.dark.text}
                />
            </TouchableOpacity>

            {/* Expanded content */}
            {expanded && (
                <View style={styles.setsContainer}>
                    {/* Header */}
                    <View style={styles.setsHeaderRow}>
                        <View style={styles.column}>
                            <ThemedText style={styles.setsHeaderText}>Set</ThemedText>
                        </View>
                        <View style={styles.column}>
                            <ThemedText style={styles.setsHeaderText}>Reps</ThemedText>
                        </View>
                        <View style={styles.column}>
                            <ThemedText style={styles.setsHeaderText}>KGs</ThemedText>
                        </View>
                    </View>

                    {/* Sets */}
                    {item.sets.map((set, index) => (
                        <View key={index} style={styles.setRow}>
                            <View style={styles.column}>
                                <ThemedText style={styles.setNumberText}>
                                    {index + 1}
                                </ThemedText>
                            </View>

                            <View style={styles.column}>
                                {editMode ? (
                                    <TextInput
                                        style={styles.inputSmall}
                                        placeholder="Reps"
                                        placeholderTextColor={Colors.dark.text}
                                        keyboardType="number-pad"
                                        value={set.reps}
                                        onChangeText={(text) =>
                                            updateSet(item.id, index, "reps", text)
                                        }
                                    />
                                ) : (
                                    <ThemedText style={styles.valueText}>
                                        {set.reps.length > 0 ? set.reps : "-"}
                                    </ThemedText>
                                )}
                            </View>

                            <View style={styles.column}>
                                {editMode ? (
                                    <TextInput
                                        style={styles.inputSmall}
                                        placeholder="KGs"
                                        placeholderTextColor={Colors.dark.text}
                                        keyboardType="decimal-pad"
                                        value={set.kgs}
                                        onChangeText={(text) =>
                                            updateSet(item.id, index, "kgs", text)
                                        }
                                    />
                                ) : (
                                    <ThemedText style={styles.valueText}>
                                        {set.kgs.length > 0 ? set.kgs : "-"}
                                    </ThemedText>
                                )}
                            </View>
                        </View>
                    ))}

                    {/* Edit actions */}
                    {editMode && (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.iconActionButton}
                                onPress={() => addSet(item.id)}
                            >
                                <MaterialIcons
                                    name="add"
                                    size={18}
                                    color={Colors.dark.background}
                                />
                                <ThemedText style={styles.iconActionText}>Add</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.iconActionButtonOutline}
                                onPress={() => removeSet(item.id)}
                            >
                                <MaterialIcons
                                    name="remove"
                                    size={18}
                                    color={Colors.dark.tint}
                                />
                                <ThemedText
                                    style={[
                                        styles.iconActionTextOutline,
                                        { color: Colors.dark.tint },
                                    ]}
                                >
                                    Remove
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    exerciseContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "rgb(30,30,30)",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.dark.text,
    },
    setsToggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "rgb(40,40,40)",
    },
    setsToggleText: {
        color: Colors.dark.text,
        fontWeight: "600",
        fontSize: 14,
    },
    setsContainer: {
        padding: 12,
        backgroundColor: "rgb(30,30,30)",
    },
    setsHeaderRow: {
        flexDirection: "row",
        marginBottom: 6,
    },
    setsHeaderText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.dark.text,
    },
    setRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    column: {
        flex: 1,
        alignItems: "center",
    },
    setNumberText: {
        fontSize: 14,
        color: Colors.dark.text,
    },
    valueText: {
        fontSize: 14,
        color: Colors.dark.text,
    },
    inputSmall: {
        backgroundColor: "rgb(47,47,47)",
        color: Colors.dark.text,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        fontSize: 14,
        textAlign: "center",
        width: 60,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        width: "100%",
        gap: 12,
    },
    iconActionButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.dark.tint,
        borderRadius: 8,
        paddingVertical: 8,
    },
    iconActionButtonOutline: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.dark.tint,
        borderRadius: 8,
        paddingVertical: 8,
    },
    iconActionText: {
        color: Colors.dark.background,
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "600",
    },
    iconActionTextOutline: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "600",
    },
});