import fs from 'fs/promises';
import path from 'path';

async function walk(dir, files = []) {
  const list = await fs.readdir(dir);
  for (let file of list) {
    file = path.resolve(dir, file);
    const stat = await fs.stat(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
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
  const jsFiles = allFiles.filter(f => f.endsWith('.js'));
  const htmlFiles = allFiles.filter(f => f.endsWith('.html'));
  
  console.log(`Found ${mdFiles.length} Markdown, ${jsFiles.length} JS, ${htmlFiles.length} HTML files.\n`);
  
  let issues = 0;
  
  for (const f of mdFiles) {
    const content = await fs.readFile(f, 'utf8');
    if (f.includes('/content/') && !content.startsWith('---')) {
      console.log(`[Missing Frontmatter] ${f}`);
      issues++;
    }
    
    // Check for stray quotes or unclosed links
    if (content.match(/\]\(\s*$/m)) {
      console.log(`[Broken Link Syntax] ${f}`);
      issues++;
    }
  }
  
  for (const f of jsFiles) {
    const content = await fs.readFile(f, 'utf8');
    if (content.includes('TODO:') || content.includes('FIXME:')) {
      console.log(`[TODO/FIXME Found] ${f}`);
      issues++;
    }
  }
  
  console.log(`\nTotal potential issues found: ${issues}`);
}

audit().catch(console.error);
