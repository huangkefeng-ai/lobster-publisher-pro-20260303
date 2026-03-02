import { describe, expect, it } from 'vitest';
import { highlightCode, isLanguageSupported } from './highlight';

describe('isLanguageSupported', () => {
  it('returns true for registered languages', () => {
    expect(isLanguageSupported('javascript')).toBe(true);
    expect(isLanguageSupported('js')).toBe(true);
    expect(isLanguageSupported('typescript')).toBe(true);
    expect(isLanguageSupported('ts')).toBe(true);
    expect(isLanguageSupported('python')).toBe(true);
    expect(isLanguageSupported('go')).toBe(true);
    expect(isLanguageSupported('rust')).toBe(true);
    expect(isLanguageSupported('bash')).toBe(true);
    expect(isLanguageSupported('json')).toBe(true);
    expect(isLanguageSupported('css')).toBe(true);
    expect(isLanguageSupported('html')).toBe(true);
    expect(isLanguageSupported('sql')).toBe(true);
    expect(isLanguageSupported('yaml')).toBe(true);
    expect(isLanguageSupported('diff')).toBe(true);
  });

  it('returns true for short aliases', () => {
    expect(isLanguageSupported('py')).toBe(true);
    expect(isLanguageSupported('rb')).toBe(true);
    expect(isLanguageSupported('sh')).toBe(true);
    expect(isLanguageSupported('kt')).toBe(true);
    expect(isLanguageSupported('rs')).toBe(true);
    expect(isLanguageSupported('cs')).toBe(true);
    expect(isLanguageSupported('yml')).toBe(true);
    expect(isLanguageSupported('md')).toBe(true);
  });

  it('returns false for unregistered languages', () => {
    expect(isLanguageSupported('brainfuck')).toBe(false);
    expect(isLanguageSupported('cobol')).toBe(false);
    expect(isLanguageSupported('')).toBe(false);
  });
});

describe('highlightCode', () => {
  it('highlights JavaScript keywords with inline styles', () => {
    const result = highlightCode('const x = 1;', 'js');
    expect(result).toContain('<span style="color:');
    expect(result).toContain('const');
    expect(result).not.toContain('class=');
  });

  it('highlights TypeScript code', () => {
    const result = highlightCode('const n: number = 42;', 'ts');
    expect(result).toContain('<span style="color:');
    expect(result).toContain('const');
  });

  it('highlights Python code', () => {
    const result = highlightCode('def hello():\n  print("hi")', 'python');
    expect(result).toContain('<span style="color:');
    expect(result).toContain('def');
  });

  it('falls back to HTML-escaped output for unknown language', () => {
    const result = highlightCode('foo <bar> & "baz"', 'unknownlang');
    expect(result).toBe('foo &lt;bar&gt; &amp; &quot;baz&quot;');
    expect(result).not.toContain('<span');
  });

  it('falls back to HTML-escaped output for empty language', () => {
    const result = highlightCode('<script>alert(1)</script>', '');
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('is case-insensitive for language matching', () => {
    const result = highlightCode('const x = 1;', 'JS');
    expect(result).toContain('<span style="color:');
  });

  it('trims whitespace from language string', () => {
    const result = highlightCode('const x = 1;', '  js  ');
    expect(result).toContain('<span style="color:');
  });

  it('produces no class attributes in output (all inline styles)', () => {
    const result = highlightCode('SELECT * FROM users WHERE id = 1;', 'sql');
    expect(result).not.toMatch(/class="/);
  });

  it('handles multi-line code correctly', () => {
    const code = 'function add(a, b) {\n  return a + b;\n}';
    const result = highlightCode(code, 'js');
    expect(result).toContain('function');
    expect(result).toContain('return');
    expect(result).toContain('\n');
  });

  it('handles code with backticks without crashing', () => {
    const result = highlightCode('const s = `hello ${world}`;', 'js');
    expect(result).toContain('const');
  });
});
