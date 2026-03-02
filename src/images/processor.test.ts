import { describe, expect, it, vi } from 'vitest';
import { processImageFile } from './processor';

describe('images/processor', () => {
  it('should process image and return a base64 data URL', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });

    const originalImage = globalThis.Image;

    class MockImage {
      width = 800;
      height = 600;
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: string | Event) => unknown) | null = null;

      set src(_value: string) {
        setTimeout(() => {
          this.onload?.(new Event('load'));
        }, 0);
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    const toDataURLSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/jpeg;base64,mocked');

    try {
      const result = await processImageFile(mockFile);

      expect(result).toBe('data:image/jpeg;base64,mocked');
      expect(createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    } finally {
      globalThis.Image = originalImage;
      getContextSpy.mockRestore();
      toDataURLSpy.mockRestore();
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    }
  });

  it('should reject when canvas context is unavailable', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });
    const originalImage = globalThis.Image;

    class MockImage {
      width = 800;
      height = 600;
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: string | Event) => unknown) | null = null;

      set src(_value: string) {
        setTimeout(() => {
          this.onload?.(new Event('load'));
        }, 0);
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    try {
      await expect(processImageFile(mockFile)).rejects.toThrow('Failed to get canvas context');
    } finally {
      globalThis.Image = originalImage;
      getContextSpy.mockRestore();
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    }
  });

  it('should clamp jpeg quality and resize oversized images', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });
    const originalImage = globalThis.Image;

    class MockImage {
      width = 2000;
      height = 1000;
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: string | Event) => unknown) | null = null;

      set src(_value: string) {
        setTimeout(() => {
          this.onload?.(new Event('load'));
        }, 0);
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;
    const drawImage = vi.fn();
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    const toDataURLSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/jpeg;base64,mocked');

    try {
      const result = await processImageFile(mockFile, { maxWidth: 1200, maxHeight: 1200, quality: 3 });

      expect(result).toBe('data:image/jpeg;base64,mocked');
      expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1200, 600);
      expect(toDataURLSpy).toHaveBeenCalledWith('image/jpeg', 1);
    } finally {
      globalThis.Image = originalImage;
      getContextSpy.mockRestore();
      toDataURLSpy.mockRestore();
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    }
  });

  it('should serialize png output without jpeg quality parameter', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const mockFile = new File(['mock-data'], 'test.png', { type: 'image/png' });
    const originalImage = globalThis.Image;

    class MockImage {
      width = 800;
      height = 600;
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: string | Event) => unknown) | null = null;

      set src(_value: string) {
        setTimeout(() => {
          this.onload?.(new Event('load'));
        }, 0);
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    const toDataURLSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mocked');

    try {
      const result = await processImageFile(mockFile, { quality: 0.1 });

      expect(result).toBe('data:image/png;base64,mocked');
      expect(toDataURLSpy).toHaveBeenCalledWith('image/png', undefined);
    } finally {
      globalThis.Image = originalImage;
      getContextSpy.mockRestore();
      toDataURLSpy.mockRestore();
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    }
  });

  it('should reject when image dimensions are invalid', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });
    const originalImage = globalThis.Image;

    class MockImage {
      width = 0;
      height = 300;
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: string | Event) => unknown) | null = null;

      set src(_value: string) {
        setTimeout(() => {
          this.onload?.(new Event('load'));
        }, 0);
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      await expect(processImageFile(mockFile)).rejects.toThrow('Invalid image dimensions');
    } finally {
      globalThis.Image = originalImage;
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    }
  });

  it('should reject when image loading fails', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });
    const originalImage = globalThis.Image;

    class MockImage {
      width = 800;
      height = 600;
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: string | Event) => unknown) | null = null;

      set src(_value: string) {
        setTimeout(() => {
          this.onerror?.(new Event('error'));
        }, 0);
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      await expect(processImageFile(mockFile)).rejects.toThrow('Failed to load image');
    } finally {
      globalThis.Image = originalImage;
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    }
  });

  it('should reject when serialization throws during processing', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });
    const originalImage = globalThis.Image;

    class MockImage {
      width = 800;
      height = 600;
      onload: ((event: Event) => unknown) | null = null;
      onerror: ((event: string | Event) => unknown) | null = null;

      set src(_value: string) {
        setTimeout(() => {
          this.onload?.(new Event('load'));
        }, 0);
      }
    }

    globalThis.Image = MockImage as unknown as typeof Image;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    const toDataURLSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
      throw new Error('serialization failed');
    });

    try {
      await expect(processImageFile(mockFile)).rejects.toThrow('Failed to process image');
    } finally {
      globalThis.Image = originalImage;
      getContextSpy.mockRestore();
      toDataURLSpy.mockRestore();
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
    }
  });
});
