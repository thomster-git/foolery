/**
 * Project Atlas — Lightweight Markdown Body Parser
 */

export default function parseMarkdown(markdownText = "") {
  if (!markdownText) return "";

  let text = markdownText.trim();

  // Code blocks ```lang\ncode\n```
  text = text.replace(/```([^\n]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const langClass = lang.trim() ? ` class="language-${escapeHtml(lang.trim())}"` : '';
    return `<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Blockquotes > quote
  text = text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  text = text.replace(/<\/blockquote>\s*<blockquote>/g, '<br>');

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
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
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

  // Bullet lists (- or * at start of line)
  const lines = text.split('\n');
  let inList = false;
  const resultLines = [];

  for (let line of lines) {
    const listMatch = line.match(/^[\*\-]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        resultLines.push('<ul>');
        inList = true;
      }
      resultLines.push(`  <li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        resultLines.push('</ul>');
        inList = false;
      }
      resultLines.push(line);
    }
  }
  if (inList) {
    resultLines.push('</ul>');
  }

  text = resultLines.join('\n');

  // Split into paragraphs for text blocks not already wrapped in HTML tags
  const blocks = text.split(/\n\s*\n/);
  return blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|div|p|article|section|table)/i.test(block)) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).filter(Boolean).join('\n\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
