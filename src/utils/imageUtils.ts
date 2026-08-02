/**
 * Utility functions for handling image uploads, compression, and fallbacks.
 */

export const DEFAULT_CIVIC_IMAGE = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop';
export const DEFAULT_RESOLUTION_IMAGE = 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=800&auto=format&fit=crop';

/**
 * Checks if an image URL is valid for cross-session display (not a blob URL or empty)
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '') return false;
  if (url.startsWith('blob:')) return false;
  return true;
}

/**
 * Returns a valid image URL or the default fallback image
 */
export function getValidImageUrl(url?: string | null, fallback = DEFAULT_CIVIC_IMAGE): string {
  if (isValidImageUrl(url)) return url!;
  return fallback;
}

/**
 * Compresses an image File and converts it to a persistent Data URL (Base64 string).
 * Scales down large images to max dimensions while maintaining aspect ratio and image quality.
 */
export function compressAndConvertToDataUrl(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, use standard FileReader
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to uncompressed base64 if canvas context is null
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        // Fallback to uncompressed base64
        resolve(event.target?.result as string);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
