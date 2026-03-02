import { test, expect } from '@playwright/test';

test.describe('Lobster Publisher Pro E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
  });

  test('should input text and render preview', async ({ page }) => {
    // Get the textarea
    const textarea = page.locator('textarea.editor-textarea');
    
    // Clear initial content
    await textarea.fill('');
    
    // Check empty state
    await expect(textarea).toHaveClass(/empty-state/);
    await expect(page.locator('.preview-empty')).toBeVisible();

    // Type some markdown
    const md = `# Hello E2E Test\n\nThis is a paragraph.`;
    await textarea.fill(md);

    // Wait for debounce and preview to update
    await page.waitForTimeout(500);

    // Verify preview renders the h1 and paragraph
    const preview = page.locator('.article-preview');
    await expect(preview.locator('h1')).toHaveText('Hello E2E Test');
    await expect(preview.locator('p')).toHaveText('This is a paragraph.');
  });

  test('should insert image on upload', async ({ page }) => {
    // Clear initial content
    const textarea = page.locator('textarea.editor-textarea');
    await textarea.fill('');

    // Prepare a mock 1x1 transparent png
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    // We upload using the hidden file input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTitle('Upload or paste image').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    // Wait for the base64 markdown to appear in the textarea
    await expect(textarea).toHaveValue(/!\[test\.png\]\(data:image\/png;base64,/);

    // Also the preview should eventually render the image
    await page.waitForTimeout(500);
    const imgInPreview = page.locator('.article-preview img');
    await expect(imgInPreview).toBeVisible();
    await expect(imgInPreview).toHaveAttribute('src', /data:image\/png;base64,/);
  });

  test('should display error prompt for invalid image upload', async ({ page }) => {
    // We upload an invalid file with an image mime type to trigger img.onerror
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTitle('Upload or paste image').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'broken.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('This is not an image data'),
    });

    // We expect the error text to appear
    const errorText = page.locator('.error-text');
    await expect(errorText).toBeVisible();
    await expect(errorText).toHaveText('Image processing failed. Try another image.');
  });

});
