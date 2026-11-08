const fs = require('fs');
const path = require('path');

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (filePath.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = findHtmlFiles('website/dist');
const allLinks = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hrefRegex = /href="(\/[^"]+)"/g;
  const srcRegex = /src="(\/[^"]+)"/g;

  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    allLinks.push({ file, link: match[1].split('?')[0].split('#')[0], type: 'href', raw: match[1] });
  }
  while ((match = srcRegex.exec(content)) !== null) {
    allLinks.push({ file, link: match[1].split('?')[0].split('#')[0], type: 'src', raw: match[1] });
  }
});

const brokenLinks = [];
allLinks.forEach(({ file, link, type, raw }) => {
  let targetPath = path.join('website/dist', link);
  
  if (link.endsWith('/')) {
    targetPath = path.join(targetPath, 'index.html');
  }

  if (!fs.existsSync(targetPath)) {
    if (fs.existsSync(targetPath + '.html')) {
       brokenLinks.push(`File: ${file} | Link: ${raw} -> exists as .html but link lacks extension and doesn't point to a directory`);
    } else if (fs.existsSync(path.join('website/dist', link + '.html'))) {
       brokenLinks.push(`File: ${file} | Link: ${raw} -> exists as .html but linked as directory or without extension`);
    } else {
       brokenLinks.push(`File: ${file} | Link: ${raw} -> NOT FOUND`);
    }
  }
});

console.log([...new Set(brokenLinks)].join('\n'));
