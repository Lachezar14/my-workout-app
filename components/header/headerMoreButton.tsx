import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useModal } from "@/context/ModalContext";

export function HeaderMoreButton() {
    const { openModal } = useModal();
    return (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={openModal}>
            <MaterialIcons name="more-vert" size={28} color="#fff" />
        </TouchableOpacity>
    );
}

