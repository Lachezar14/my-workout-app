// @/repository/storageSupabase.ts
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import {supabase} from "@/supabaseClient";

/**
 * Upload an image or GIF to Supabase Storage and return its public URL
 */
export async function uploadImageToSupabase(
    fileUri: string,
    exerciseName: string
): Promise<string | null> {
    try {
        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Determine file extension
        const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${exerciseName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        // Determine content type
        let contentType = `image/${fileExt}`;
        if (fileExt === 'gif') contentType = 'image/gif';

        // Convert to ArrayBuffer (preserves raw binary)
        const arrayBuffer = decode(base64);

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from('exercise_images')
            .upload(filePath, arrayBuffer, {
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

/**
 * Replace old image with new image for an exercise, returning the new image URL
 */
export async function replaceExerciseImage(
    oldImageUrl: string | null,
    newFileUri: string,
    exerciseName: string
): Promise<string | null> {
    // Delete old image first
    if (oldImageUrl) {
        await deleteImageFromSupabase(oldImageUrl);
    }

    // Upload new image
    const newUrl = await uploadImageToSupabase(newFileUri, exerciseName);
    return newUrl;
}

/**
 * Delete an image from Supabase given its public URL, returning success status
 */
export async function deleteImageFromSupabase(publicUrl: string): Promise<boolean> {
    try {
        const path = publicUrl.split('/storage/v1/object/public/exercise_images/')[1];
        if (!path) return false;

        const { error } = await supabase.storage
            .from('exercise_images')
            .remove([path]);

        if (error) {
            console.error('Delete error:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
}