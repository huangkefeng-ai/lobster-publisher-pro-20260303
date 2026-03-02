function collapseInlineWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ');
}

function escapeMarkdownText(value: string): string {
  return value.replace(/([*_`~])/g, '\\$1');
}

function longestBacktickRun(value: string): number {
  const matches = value.match(/`+/g);
  if (!matches) {
    return 0;
  }

  return matches.reduce((max, match) => Math.max(max, match.length), 0);
}

function wrapWithBacktickFence(value: string): string {
  const fence = '`'.repeat(longestBacktickRun(value) + 1);
  return `${fence}${value}${fence}`;
}

function hasAllowedProtocol(url: string, allowedProtocols: readonly string[]): boolean {
  return allowedProtocols.some((protocol) => url.toLowerCase().startsWith(`${protocol}:`));
}

function sanitizeMarkdownDestination(url: string): string {
  const stripped = url
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 0x20 && code !== 0x7f;
    })
    .join('')
    .trim();
  if (stripped.length === 0) {
    return '';
  }

  return encodeURI(stripped).replace(/[()]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function renderList(node: Element, depth = 0): string {
  const isOrdered = node.tagName.toLowerCase() === 'ol';
  const items = Array.from(node.children).filter((child) => child.tagName.toLowerCase() === 'li');

  const rendered = items
    .map((item, index) => {
      const marker = isOrdered ? `${index + 1}.` : '-';
      const indent = '  '.repeat(depth);
      const nestedLists: string[] = [];
      const inlineContent = Array.from(item.childNodes)
        .map((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const tag = (child as Element).tagName.toLowerCase();
            if (tag === 'ul' || tag === 'ol') {
              const nested = renderList(child as Element, depth + 1).trimEnd();
              if (nested.length > 0) {
                nestedLists.push(nested);
              }
              return '';
            }
          }
          return renderNode(child, depth + 1);
        })
        .join('')
        .trim();

      const line = `${indent}${marker}${inlineContent.length > 0 ? ` ${inlineContent}` : ''}`;
      if (nestedLists.length === 0) {
        return line;
      }
      return `${line}\n${nestedLists.join('\n')}`;
    })
    .join('\n');

  return rendered.length > 0 ? `${rendered}\n\n` : '';
}

function renderNode(node: Node, depth = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const collapsed = collapseInlineWhitespace(node.textContent ?? '');
    return collapsed.trim().length === 0 ? '' : escapeMarkdownText(collapsed);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as Element;
  const tag = element.tagName.toLowerCase();

  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = Number.parseInt(tag.slice(1), 10);
      const heading = renderChildren(element, depth).trim();
      return `${'#'.repeat(level)} ${heading}\n\n`;
    }
    case 'p':
    case 'div': {
      const content = renderChildren(element, depth).trim();
      return content.length > 0 ? `${content}\n\n` : '';
    }
    case 'br':
      return '\n';
    case 'strong':
    case 'b': {
      const content = renderChildren(element, depth).trim();
      return content.length > 0 ? `**${content}**` : '';
    }
    case 'em':
    case 'i': {
      const content = renderChildren(element, depth).trim();
      return content.length > 0 ? `*${content}*` : '';
    }
    case 'del':
    case 's': {
      const content = renderChildren(element, depth).trim();
      return content.length > 0 ? `~~${content}~~` : '';
    }
    case 'code': {
      const content = element.textContent?.trim() ?? '';
      return content.length > 0 ? wrapWithBacktickFence(content) : '';
    }
    case 'pre': {
      const codeText = element.textContent?.replace(/^\n+|\n+$/g, '') ?? '';
      if (codeText.length === 0) {
        return '';
      }

      const fence = '`'.repeat(Math.max(3, longestBacktickRun(codeText) + 1));
      return `${fence}\n${codeText}\n${fence}\n\n`;
    }
    case 'blockquote': {
      const content = renderChildren(element, depth)
        .trim()
        .split('\n')
        .map((line) => (line.trim().length > 0 ? `> ${line}` : '>'))
        .join('\n');
      return content.length > 0 ? `${content}\n\n` : '';
    }
    case 'ul':
    case 'ol':
      return renderList(element, depth);
    case 'li': {
      const content = renderChildren(element, depth).trim();
      return content.length > 0 ? `- ${content}\n` : '';
    }
    case 'a': {
      const href = element.getAttribute('href')?.trim();
      const textContent = renderChildren(element, depth).trim();
      if (!href) {
        return textContent;
      }
      if (!hasAllowedProtocol(href, ['http', 'https', 'mailto', 'tel'])) {
        return textContent;
      }
      const destination = sanitizeMarkdownDestination(href);
      if (destination.length === 0) {
        return textContent;
      }
      const text = textContent || href;
      const safeText = (text ?? '').replace(/\]/g, '\\]');
      return `[${safeText}](${destination})`;
    }
    case 'img': {
      const src = element.getAttribute('src')?.trim();
      if (!src) {
        return '';
      }
      if (!hasAllowedProtocol(src, ['http', 'https'])) {
        return '';
      }
      const destination = sanitizeMarkdownDestination(src);
      if (destination.length === 0) {
        return '';
      }
      const alt = (element.getAttribute('alt')?.trim() ?? '').replace(/\]/g, '\\]');
      return `![${alt}](${destination})`;
    }
    case 'table': {
      const rows = Array.from(element.querySelectorAll('tr'));
      const rowCells = rows
        .map((row) =>
          Array.from(row.children).filter(
            (cell) => cell.tagName.toLowerCase() === 'td' || cell.tagName.toLowerCase() === 'th',
          ),
        )
        .filter((cells) => cells.length > 0);
      if (rowCells.length === 0) return '';
      const escPipe = (s: string) => s.replace(/\|/g, '\\|');
      const columnCount = Math.max(...rowCells.map((cells) => cells.length));
      const toRow = (cells: Element[]) =>
        Array.from({ length: columnCount }, (_, index) => {
          const cell = cells[index];
          return cell ? escPipe(renderChildren(cell, depth).trim()) : '';
        }).join(' | ');
      const header = toRow(rowCells[0]);
      const separator = Array.from({ length: columnCount }, () => '---').join(' | ');
      const body = rowCells
        .slice(1)
        .map((cells) => `| ${toRow(cells)} |`)
        .join('\n');
      return `| ${header} |\n| ${separator} |\n${body}\n\n`;
    }
    case 'thead':
    case 'tbody':
    case 'tfoot':
    case 'tr':
    case 'td':
    case 'th':
      return renderChildren(element, depth);
    case 'hr':
      return '\n---\n\n';
    case 'style':
    case 'script':
      return '';
    default:
      return renderChildren(element, depth);
  }
}

function renderChildren(node: Node, depth = 0): string {
  return Array.from(node.childNodes)
    .map((child) => renderNode(child, depth))
    .join('');
}

export function richTextToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(trimmed, 'text/html');
  return renderChildren(document.body)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function markdownFromClipboard(html: string, plainText: string): string {
  if (html.trim().length > 0) {
    const converted = richTextToMarkdown(html);
    if (converted.length > 0) {
      return converted;
    }
  }

  return plainText;
}
