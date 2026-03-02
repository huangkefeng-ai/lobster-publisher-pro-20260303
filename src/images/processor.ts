export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function processImageFile(file: File, options: ProcessImageOptions = {}): Promise<string> {
  const maxWidth = Number.isFinite(options.maxWidth) && options.maxWidth && options.maxWidth > 0 ? options.maxWidth : 1200;
  const maxHeight =
    Number.isFinite(options.maxHeight) && options.maxHeight && options.maxHeight > 0 ? options.maxHeight : 1200;
  const normalizedQuality =
    Number.isFinite(options.quality) && options.quality !== undefined
      ? Math.max(0, Math.min(1, options.quality))
      : 0.85;

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(url);

        let { width, height } = img;
        if (width <= 0 || height <= 0) {
          reject(new Error('Invalid image dimensions'));
          return;
        }

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const TRANSPARENT_TYPES = new Set(['image/png', 'image/webp', 'image/gif']);
        const mimeType = TRANSPARENT_TYPES.has(file.type) ? 'image/png' : 'image/jpeg';
        const outputQuality = mimeType === 'image/jpeg' ? normalizedQuality : undefined;

        const dataUrl = canvas.toDataURL(mimeType, outputQuality);
        resolve(dataUrl);
      } catch {
        reject(new Error('Failed to process image'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
