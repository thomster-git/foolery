import fs from 'fs/promises';
import path from 'path';

async function walk(dir, files = []) {
  const list = await fs.readdir(dir);
  for (let file of list) {
    file = path.resolve(dir, file);
    const stat = await fs.stat(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist') && !file.includes('_site')) {
        await walk(file, files);
      }
    } else {
      files.push(file);
    }
  }
  return files;
}

async function audit() {
  const allFiles = await walk('/home/keel/Project-Atlas-main');
  const mdFiles = allFiles.filter(f => f.endsWith('.md'));
  const htmlFiles = allFiles.filter(f => f.endsWith('.html') && f.includes('templates'));
  
  const issues = [];

  for (const f of mdFiles) {
    const content = await fs.readFile(f, 'utf8');
    
    // Frontmatter check
    if (f.includes('/content/') && !content.startsWith('---')) {
      issues.push(`[Missing Frontmatter] ${f}`);
    }
    
    // Markdown link checks
    const brokenLink1 = /\[[^\]]*\]\(\s*\)/.test(content); // Empty link
    if (brokenLink1) issues.push(`[Empty Markdown Link] ${f}`);
    
    // Stray quotes in frontmatter values (potential parse errors like I saw earlier)
    if (content.startsWith('---')) {
      const frontmatter = content.split('---')[1];
      if (frontmatter && frontmatter.match(/:\s*".*"/)) {
         issues.push(`[Quoted Frontmatter Value - Potential Parser Bug Risk] ${f}`);
      }
    }
  }
  
  for (const f of htmlFiles) {
     const content = await fs.readFile(f, 'utf8');
     // Check for unclosed template tags
     const openTags = (content.match(/\{\{/g) || []).length;
     const closeTags = (content.match(/\}\}/g) || []).length;
     if (openTags !== closeTags) {
         issues.push(`[Mismatched Template Tags] ${f}: ${openTags} open, ${closeTags} close`);
     }
  }

  console.log(issues.join('\n'));
}

audit().catch(console.error);
