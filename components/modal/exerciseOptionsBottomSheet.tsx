import React, { useMemo, useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

type Props = {
    isVisible: boolean;
    onClose: () => void;
    onOption1?: () => void;
    onOption2?: () => void;
};

export default function ExerciseOptionsBottomSheet({ isVisible, onClose, onOption1, onOption2 }: Props) {
    const sheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["50%"], []);

    return (
        <BottomSheet
            ref={sheetRef}
            index={isVisible ? 0 : -1} // -1 = closed
            snapPoints={snapPoints}
            enablePanDownToClose={true} // swipe down to close
            onClose={onClose}
            backgroundStyle={{ backgroundColor: Colors.dark.background }}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={() => { onOption1?.(); onClose(); }}>
                    <ThemedText>Option 1</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => { onOption2?.(); onClose(); }}>
                    <ThemedText>Option 2</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: "#FF4C4C" }]} onPress={onClose}>
                    <ThemedText style={{ color: "#fff" }}>Cancel</ThemedText>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "flex-start",
    },
    button: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: Colors.dark.tint,
        alignItems: "center",
        marginVertical: 6,
    },
});
