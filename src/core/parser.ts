function collapseInlineWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ');
}

function escapeMarkdownText(value: string): string {
  return value.replace(/([*_`~])/g, '\\$1');
}

function renderList(node: Element, depth = 0): string {
  const isOrdered = node.tagName.toLowerCase() === 'ol';
  const items = Array.from(node.children).filter((child) => child.tagName.toLowerCase() === 'li');

  const rendered = items
    .map((item, index) => {
      const marker = isOrdered ? `${index + 1}.` : '-';
      const indent = '  '.repeat(depth);
      const text = renderChildren(item, depth + 1).trim();
      return `${indent}${marker} ${text}`;
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
    case 'code': {
      const content = element.textContent?.trim() ?? '';
      return content.length > 0 ? `\`${content}\`` : '';
    }
    case 'pre': {
      const codeText = element.textContent?.replace(/^\n+|\n+$/g, '') ?? '';
      return codeText.length > 0 ? `\`\`\`\n${codeText}\n\`\`\`\n\n` : '';
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
      const text = renderChildren(element, depth).trim() || href;
      if (!href) {
        return text ?? '';
      }
      return `[${text}](${href})`;
    }
    case 'img': {
      const src = element.getAttribute('src')?.trim();
      if (!src) {
        return '';
      }
      const alt = element.getAttribute('alt')?.trim() ?? '';
      return `![${alt}](${src})`;
    }
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
