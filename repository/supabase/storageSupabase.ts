// @/repository/storageSupabase.ts
import {supabase} from "@/supabaseClient";
import {encodeImage} from "@/utils/imageService";

/**
 * Upload an image or GIF to Supabase Storage and return its public URL
 */
export async function uploadImageToSupabase(
    fileUri: string,
    exerciseName: string
): Promise<string | null> {
    try {
        const { arrayBuffer, fileName, contentType } = await encodeImage(fileUri, exerciseName);

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from('exercise_images')
            .upload(fileName, arrayBuffer, {
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