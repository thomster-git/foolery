/**
 * Project Atlas — Lightweight Markdown Body Parser
 */

export default function parseMarkdown(markdownText = "") {
  if (!markdownText) return "";

  let text = markdownText.trim();

  // 1. Extract and protect code blocks with placeholders
  const codeBlocks = [];
  text = text.replace(/```([^\n]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const langClass = lang.trim() ? ` class="language-${escapeHtml(lang.trim())}"` : '';
    const placeholder = `%%%ATLAS_CODE_BLOCK_${codeBlocks.length}%%%`;
    codeBlocks.push(`<pre><code${langClass}>${escapeHtml(code.replace(/^\n+|\n+$/g, ""))}</code></pre>`);
    return placeholder;
  });

  // Blockquotes > quote (and GitHub-style alert callouts > [!WARNING], > [!IMPORTANT], etc.)
  text = text.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
  text = text.replace(/<\/blockquote>\s*<blockquote>/g, '<br>');
  text = text.replace(/<blockquote>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:<br>|\s*)([\s\S]*?)<\/blockquote>/gi, (match, type, content) => {
    const lower = type.toLowerCase();
    const icons = { note: 'ℹ️', tip: '💡', important: '📌', warning: '⚠️', caution: '🚨' };
    const icon = icons[lower] || 'ℹ️';
    return `<aside class="article-callout article-callout--${lower}"><div class="article-callout-header"><span>${icon}</span><span>${type.toUpperCase()}</span></div><div class="article-callout-body">${content}</div></aside>`;
  });

  // Headings # ## ###
  text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  text = text.replace(/^---$/gm, '<hr>');

  // Images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="article-image" loading="lazy" />');

  // Inline formatting: bold, italic, inline code, links
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`);
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Markdown tables: | col1 | col2 |\n|---|---|\n| val1 | val2 |
  text = text.replace(/(\|.+?\|\n\|[-:\s|]+\|\n(?:\|.+?\|(?:\n|$))+)/g, (match) => {
    const rows = match.trim().split('\n').map(r => r.trim());
    if (rows.length < 3) return match;
    const parseCells = (row) => row.split('|').slice(1, -1).map(c => c.trim());
    const headers = parseCells(rows[0]).map(h => `<th>${h}</th>`).join('');
    const bodyRows = rows.slice(2).map(row => {
      const cells = parseCells(row).map(c => `<td>${c}</td>`).join('');
      return `  <tr>${cells}</tr>`;
    }).join('\n');
    return `<table class="article-table">\n<thead>\n  <tr>${headers}</tr>\n</thead>\n<tbody>\n${bodyRows}\n</tbody>\n</table>`;
  });

  // Bullet lists (- or *) and ordered lists (1., 2., etc.)
  const lines = text.split('\n');
  let listType = null; // 'ul' | 'ol' | null
  const resultLines = [];

  for (let line of lines) {
    const ulMatch = line.match(/^\s*[\*\-]\s+(.+)$/);
    const olMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        if (listType) resultLines.push(`</${listType}>`);
        resultLines.push('<ul>');
        listType = 'ul';
      }
      resultLines.push(`  <li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (listType !== 'ol') {
        if (listType) resultLines.push(`</${listType}>`);
        resultLines.push('<ol>');
        listType = 'ol';
      }
      resultLines.push(`  <li>${olMatch[1]}</li>`);
    } else {
      if (listType) {
        resultLines.push(`</${listType}>`);
        listType = null;
      }
      resultLines.push(line);
    }
  }
  if (listType) {
    resultLines.push(`</${listType}>`);
  }

  text = resultLines.join('\n');

  // Split into paragraphs for text blocks not already wrapped in HTML tags
  const blocks = text.split(/\n\s*\n/);
  let parsedHtml = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(\/)?(h[1-6]|ul|ol|li|blockquote|aside|pre|hr|div|p|article|section|table|details|summary)/i.test(block) || /^%%%ATLAS_CODE_BLOCK_\d+%%%$/.test(block)) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).filter(Boolean).join('\n\n');

  // Restore protected code blocks
  parsedHtml = parsedHtml.replace(/%%%ATLAS_CODE_BLOCK_(\d+)%%%/g, (match, index) => {
    return codeBlocks[Number(index)] || '';
  });

  return parsedHtml;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
