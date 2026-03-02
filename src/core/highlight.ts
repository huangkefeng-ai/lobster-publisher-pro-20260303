import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import ruby from 'highlight.js/lib/languages/ruby';
import php from 'highlight.js/lib/languages/php';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import diff from 'highlight.js/lib/languages/diff';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby);
hljs.registerLanguage('php', php);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('kt', kotlin);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('diff', diff);

/**
 * Inline color map for highlight.js token classes.
 * Uses a neutral dark-on-light palette that works across all themes.
 * Colours are applied as inline `style` so they survive WeChat sanitization
 * (which strips `class` attributes but preserves `style`).
 */
const TOKEN_COLORS: Record<string, string> = {
  'hljs-keyword': '#d73a49',
  'hljs-built_in': '#6f42c1',
  'hljs-type': '#6f42c1',
  'hljs-literal': '#005cc5',
  'hljs-number': '#005cc5',
  'hljs-string': '#032f62',
  'hljs-regexp': '#032f62',
  'hljs-symbol': '#e36209',
  'hljs-bullet': '#e36209',
  'hljs-meta': '#6a737d',
  'hljs-comment': '#6a737d',
  'hljs-doctag': '#d73a49',
  'hljs-attr': '#6f42c1',
  'hljs-attribute': '#005cc5',
  'hljs-name': '#22863a',
  'hljs-tag': '#22863a',
  'hljs-selector-tag': '#22863a',
  'hljs-selector-class': '#6f42c1',
  'hljs-selector-id': '#005cc5',
  'hljs-variable': '#e36209',
  'hljs-template-variable': '#e36209',
  'hljs-params': '#24292e',
  'hljs-title': '#6f42c1',
  'hljs-title.function_': '#6f42c1',
  'hljs-title.class_': '#6f42c1',
  'hljs-section': '#005cc5',
  'hljs-link': '#032f62',
  'hljs-operator': '#d73a49',
  'hljs-property': '#005cc5',
  'hljs-punctuation': '#24292e',
  'hljs-subst': '#24292e',
  'hljs-addition': '#22863a',
  'hljs-deletion': '#b31d28',
};

/**
 * Convert highlight.js class-based `<span>` output to inline-style `<span>`.
 * This ensures syntax colours survive DOMPurify / WeChat sanitisation which
 * strips `class` but keeps `style`.
 */
function classesToInlineStyles(html: string): string {
  return html.replace(
    /<span class="([^"]+)">/g,
    (_match, classes: string) => {
      const classList = classes.split(/\s+/);
      for (const cls of classList) {
        const color = TOKEN_COLORS[cls];
        if (color) {
          return `<span style="color:${color}">`;
        }
      }
      // No known token — render as unstyled span (safe fallback).
      return '<span>';
    },
  );
}

/** Returns true if highlight.js has a grammar registered for the given alias. */
export function isLanguageSupported(lang: string): boolean {
  return hljs.getLanguage(lang) !== undefined;
}

/**
 * Highlight a code string.
 *
 * - When `lang` is provided and recognised, uses that grammar.
 * - When `lang` is empty/unknown, returns the code HTML-escaped (safe fallback).
 * - Output uses inline `style` attributes (no CSS classes required).
 */
export function highlightCode(code: string, lang: string): string {
  const trimmedLang = lang.trim().toLowerCase();

  if (trimmedLang.length > 0 && isLanguageSupported(trimmedLang)) {
    const result = hljs.highlight(code, { language: trimmedLang, ignoreIllegals: true });
    return classesToInlineStyles(result.value);
  }

  // Safe fallback: HTML-escape the code. highlight.js's `escapeHTML` is
  // internal, so we do a minimal escape inline.
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
