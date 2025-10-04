// @/repository/storageSupabase.ts
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import {supabase} from "@/supabaseClient";

export async function uploadImageToSupabase(
    fileUri: string,
    exerciseName: string
): Promise<string | null> {
    try {
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Determine file extension from URI
        const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${exerciseName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Determine content type
        const contentType = fileExt === 'gif'
            ? 'image/gif'
            : `image/${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('exercise_images')
            .upload(filePath, decode(base64), {
                contentType,
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('exercise_images')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}