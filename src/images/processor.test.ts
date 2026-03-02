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
});
