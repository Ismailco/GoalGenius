const CODE_FENCE_PATTERN = /^```([\w-]+)?\s*$/;
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const TASK_LIST_PATTERN = /^[-*+]\s+\[( |x|X)\]\s+(.*)$/;
const UNORDERED_LIST_PATTERN = /^[-*+]\s+(.*)$/;
const ORDERED_LIST_PATTERN = /^\d+\.\s+(.*)$/;
const BLOCKQUOTE_PATTERN = /^>\s?(.*)$/;
const HORIZONTAL_RULE_PATTERN = /^(\*{3,}|-{3,}|_{3,})\s*$/;
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const INLINE_CODE_PATTERN = /`([^`]+)`/g;
const BOLD_PATTERN = /\*\*(.+?)\*\*|__(.+?)__/g;
const ITALIC_PATTERN = /(^|[^*_])\*(?!\s)(.+?)(?<!\s)\*(?!\*)|(^|[^_])_(?!\s)(.+?)(?<!\s)_(?!_)/g;
const STRIKETHROUGH_PATTERN = /~~(.+?)~~/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }

  return null;
}

function restoreTokens(input: string, tokens: string[]): string {
  return tokens.reduce(
    (output, token, index) => output.replaceAll(`@@MARKDOWN_TOKEN_${index}@@`, token),
    input,
  );
}

function applyInlineMarkdown(value: string): string {
  let output = escapeHtml(value);
  const tokens: string[] = [];

  output = output.replace(INLINE_CODE_PATTERN, (_, code: string) => {
    const token = `@@MARKDOWN_TOKEN_${tokens.length}@@`;
    tokens.push(`<code>${code}</code>`);
    return token;
  });

  output = output.replace(LINK_PATTERN, (_, label: string, url: string) => {
    const safeUrl = sanitizeUrl(url);

    if (!safeUrl) {
      return label;
    }

    const token = `@@MARKDOWN_TOKEN_${tokens.length}@@`;
    tokens.push(
      `<a href="${safeUrl}" target="_blank" rel="noreferrer">${label}</a>`,
    );
    return token;
  });

  output = output.replace(BOLD_PATTERN, (_, first: string, second: string) => {
    const content = first ?? second;
    return `<strong>${content}</strong>`;
  });

  output = output.replace(
    ITALIC_PATTERN,
    (_match, prefixA: string, italicA: string, prefixB: string, italicB: string) => {
      const prefix = prefixA ?? prefixB ?? '';
      const content = italicA ?? italicB ?? '';
      return `${prefix}<em>${content}</em>`;
    },
  );

  output = output.replace(STRIKETHROUGH_PATTERN, '<del>$1</del>');

  return restoreTokens(output, tokens);
}

function renderParagraph(lines: string[]): string {
  return `<p>${lines.map((line) => applyInlineMarkdown(line)).join('<br />')}</p>`;
}

function renderList(listType: 'ul' | 'ol', items: string[]): string {
  return `<${listType}>${items.join('')}</${listType}>`;
}

function renderBlockquote(lines: string[]): string {
  return `<blockquote>${lines
    .map((line) => applyInlineMarkdown(line))
    .join('<br />')}</blockquote>`;
}

export function renderMarkdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const html: string[] = [];
  const paragraphLines: string[] = [];
  const blockquoteLines: string[] = [];
  const listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    html.push(renderParagraph(paragraphLines));
    paragraphLines.length = 0;
  };

  const flushList = () => {
    if (!listItems.length || !listType) {
      return;
    }

    html.push(renderList(listType, listItems));
    listItems.length = 0;
    listType = null;
  };

  const flushBlockquote = () => {
    if (!blockquoteLines.length) {
      return;
    }

    html.push(renderBlockquote(blockquoteLines));
    blockquoteLines.length = 0;
  };

  const flushCodeBlock = () => {
    const languageAttribute = codeLanguage
      ? ` data-language="${escapeHtml(codeLanguage)}"`
      : '';

    html.push(
      `<pre><code${languageAttribute}>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
    );
    inCodeBlock = false;
    codeLanguage = '';
    codeLines = [];
  };

  for (const line of lines) {
    if (inCodeBlock) {
      if (CODE_FENCE_PATTERN.test(line)) {
        flushCodeBlock();
      } else {
        codeLines.push(line);
      }
      continue;
    }

    const codeFenceMatch = line.match(CODE_FENCE_PATTERN);
    if (codeFenceMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      inCodeBlock = true;
      codeLanguage = codeFenceMatch[1] ?? '';
      codeLines = [];
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushBlockquote();
      continue;
    }

    if (HORIZONTAL_RULE_PATTERN.test(line.trim())) {
      flushParagraph();
      flushList();
      flushBlockquote();
      html.push('<hr />');
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();

      const level = headingMatch[1].length;
      const content = applyInlineMarkdown(headingMatch[2]);

      html.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    const taskMatch = line.match(TASK_LIST_PATTERN);
    if (taskMatch) {
      flushParagraph();
      flushBlockquote();

      if (listType && listType !== 'ul') {
        flushList();
      }

      listType = 'ul';

      const checked = taskMatch[1].toLowerCase() === 'x';
      listItems.push(
        `<li><label><input type="checkbox" ${checked ? 'checked ' : ''}disabled /> <span>${applyInlineMarkdown(taskMatch[2])}</span></label></li>`,
      );
      continue;
    }

    const unorderedListMatch = line.match(UNORDERED_LIST_PATTERN);
    if (unorderedListMatch) {
      flushParagraph();
      flushBlockquote();

      if (listType && listType !== 'ul') {
        flushList();
      }

      listType = 'ul';
      listItems.push(`<li>${applyInlineMarkdown(unorderedListMatch[1])}</li>`);
      continue;
    }

    const orderedListMatch = line.match(ORDERED_LIST_PATTERN);
    if (orderedListMatch) {
      flushParagraph();
      flushBlockquote();

      if (listType && listType !== 'ol') {
        flushList();
      }

      listType = 'ol';
      listItems.push(`<li>${applyInlineMarkdown(orderedListMatch[1])}</li>`);
      continue;
    }

    const blockquoteMatch = line.match(BLOCKQUOTE_PATTERN);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      blockquoteLines.push(blockquoteMatch[1]);
      continue;
    }

    flushList();
    flushBlockquote();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushBlockquote();

  if (inCodeBlock) {
    flushCodeBlock();
  }

  return html.join('\n');
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(INLINE_CODE_PATTERN, '$1')
    .replace(LINK_PATTERN, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+\[( |x|X)\]\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(BOLD_PATTERN, '$1$2')
    .replace(ITALIC_PATTERN, '$1$2$3$4')
    .replace(STRIKETHROUGH_PATTERN, '$1')
    .replace(HORIZONTAL_RULE_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
