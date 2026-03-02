const fs = require('fs');
const path = require('path');

// ARIA labels on interactive UI elements (ThemePicker)
const themePickerPath = path.join(__dirname, 'src', 'theme', 'ThemePicker.tsx');
let themePickerCode = fs.readFileSync(themePickerPath, 'utf8');

// Add aria-label to theme items
themePickerCode = themePickerCode.replace(
  "className={`theme-item ${selectedThemeId === theme.id ? 'selected' : ''}`}",
  "className={`theme-item ${selectedThemeId === theme.id ? 'selected' : ''}`}\n            aria-label={`Select ${theme.name} theme`}\n            role=\"button\"\n            tabIndex={0}"
);

// Add aria-label to search input
themePickerCode = themePickerCode.replace(
  'placeholder="Search themes..."',
  'placeholder="Search themes..."\n          aria-label="Search themes"'
);
fs.writeFileSync(themePickerPath, themePickerCode);

// Write basic tests
const testPath1 = path.join(__dirname, 'src', 'core', 'renderer.test.ts');
let testCode = fs.readFileSync(testPath1, 'utf8');
const multiImageTest = `
  it('renders multiple consecutive images as a multi-image grid array', () => {
    const markdown = '![img1](1.png) ![img2](2.png)';
    const html = renderMarkdownToHtml(markdown);
    expect(html).toContain('data-image-group="true"');
    expect(html).toContain('display: flex;');
    expect(html).toContain('1.png');
    expect(html).toContain('2.png');
  });
`;
testCode = testCode.replace("describe('renderMarkdownToHtml', () => {", "describe('renderMarkdownToHtml', () => {\n" + multiImageTest);
fs.writeFileSync(testPath1, testCode);

