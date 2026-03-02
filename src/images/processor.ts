export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function processImageFile(file: File, options: ProcessImageOptions = {}): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

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
        return reject(new Error('Failed to get canvas context'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const outputQuality = mimeType === 'image/jpeg' ? quality : undefined;

      const dataUrl = canvas.toDataURL(mimeType, outputQuality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
