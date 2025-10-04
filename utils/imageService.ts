import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * Opens image library to pick an image or video, returns the URI or null if cancelled
 */
export async function pickImage (){
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        aspect: [4, 3],
        quality: 1,
        allowsEditing: false,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
    return null;
};

/**
 * Reads a file URI, converts it to ArrayBuffer, and returns metadata
 */
export async function encodeImage(
    fileUri: string,
    exerciseName: string
) {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    // Determine file extension
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${exerciseName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;

    // Determine content type
    let contentType = `image/${fileExt}`;
    if (fileExt === 'gif') contentType = 'image/gif';

    // Convert to ArrayBuffer (preserves raw binary)
    const arrayBuffer = decode(base64);

    return {
        arrayBuffer,
        fileName,
        contentType,
    };
}