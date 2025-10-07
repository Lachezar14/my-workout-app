import React, { useState, useRef } from "react";
import { View, Text, Pressable, Animated, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {Colors} from "@/constants/theme";

interface HeaderMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

export default function HeaderMenu({ onEdit, onDelete }: HeaderMenuProps) {
    const [visible, setVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        if (visible) {
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setVisible(false));
        } else {
            setVisible(true);
            Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
        }
    };

    return (
        <View>
            <Pressable onPress={toggleMenu} hitSlop={20}>
                <Ionicons name="ellipsis-vertical" size={22} color={Colors.dark.text} />
            </Pressable>

            <Modal visible={visible} transparent animationType="none">
                <Pressable style={styles.overlay} onPress={toggleMenu}>
                    <Animated.View style={[styles.menu, { opacity: fadeAnim }]}>
                        <Pressable style={styles.menuItem} onPress={() => { toggleMenu(); onEdit(); }}>
                            <Text style={styles.menuText}>Edit</Text>
                        </Pressable>
                        <Pressable style={[styles.menuItem, styles.deleteItem]} onPress={() => { toggleMenu(); onDelete(); }}>
                            <Text style={[styles.menuText, { color: "red" }]}>Delete</Text>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "transparent",
    },
    menu: {
        position: "absolute",
        top: 50,
        right: 10,
        backgroundColor: "rgb(30,30,30)",
        borderRadius: 10,
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 120,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    deleteItem: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#444",
    },
    menuText: {
        color: Colors.dark.text,
        fontSize: 15,
    },
});
