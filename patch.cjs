const fs = require('fs');
const path = require('path');

// 1. Hardening WeChat table support
const inlineStylesPath = path.join(__dirname, 'src', 'wechat', 'inlineStyles.ts');
let inlineStylesCode = fs.readFileSync(inlineStylesPath, 'utf8');

// Update table-related styles in tagStyleMap
inlineStylesCode = inlineStylesCode.replace(
  "table: { width: '100%', 'border-collapse': 'collapse', margin: '1em 0' },",
  "table: { width: '100%', 'border-collapse': 'collapse', margin: '1em 0', 'word-break': 'break-word', 'box-sizing': 'border-box' },"
);
inlineStylesCode = inlineStylesCode.replace(
  "th: { border: `1px solid ${theme.tokens.border}`, padding: '0.45em 0.5em', 'text-align': 'left', 'background-color': theme.tokens.surface },",
  "th: { border: `1px solid ${theme.tokens.border}`, padding: '0.45em 0.5em', 'text-align': 'left', 'background-color': theme.tokens.surface, 'box-sizing': 'border-box', 'min-width': '50px' },"
);
inlineStylesCode = inlineStylesCode.replace(
  "td: { border: `1px solid ${theme.tokens.border}`, padding: '0.45em 0.5em' },",
  "td: { border: `1px solid ${theme.tokens.border}`, padding: '0.45em 0.5em', 'box-sizing': 'border-box', 'min-width': '50px' },"
);
fs.writeFileSync(inlineStylesPath, inlineStylesCode);


// 2. Multi-image layout (Renderer update)
const rendererPath = path.join(__dirname, 'src', 'core', 'renderer.ts');
let rendererCode = fs.readFileSync(rendererPath, 'utf8');

// Update DOMPurify ADD_ATTR to include styling attributes used for grids
rendererCode = rendererCode.replace(
  "ADD_ATTR: ['style', 'data-lang'],",
  "ADD_ATTR: ['style', 'data-lang', 'data-image-group'],\n    ADD_TAGS: ['span', 'div', 'section'],"
);

// Add paragraph renderer to handle consecutive images
const customRendererCode = `
const codeRenderer: RendererObject = {
  code({ text, lang }: Tokens.Code): string {
    const highlighted = highlightCode(text, lang ?? '');
    const langAttr = lang ? \` data-lang="\${lang}"\` : '';
    return \`<pre\${langAttr}><code>\${highlighted}</code></pre>\\n\`;
  },
  paragraph({ text, tokens }: Tokens.Paragraph): string | boolean {
    if (tokens && tokens.length > 1) {
      const isMultiImage = tokens.every(t => t.type === 'image' || (t.type === 'text' && !t.raw.trim()) || t.type === 'space');
      if (isMultiImage) {
        const images = tokens.filter(t => t.type === 'image') as Tokens.Image[];
        if (images.length > 1) {
          const gridHtml = images.map(img => 
             \`<div style="flex: 1; min-width: 0; padding: 2px;"><img src="\${img.href}" alt="\${img.text}" title="\${img.title || ''}" style="width: 100%; height: auto; display: block;" /></div>\`
          ).join('');
          return \`<div data-image-group="true" style="display: flex; flex-wrap: wrap; justify-content: space-between; margin: 1em 0;">\${gridHtml}</div>\\n\`;
        }
      }
    }
    return false; // let marked use default
  }
};
`;

rendererCode = rendererCode.replace(
  /const codeRenderer: RendererObject = \{[\s\S]*?\};\n/,
  customRendererCode
);

fs.writeFileSync(rendererPath, rendererCode);
