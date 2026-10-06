import MarkdownParser from '../website/core/markdown-parser.js';
import Normalizer from '../website/core/normalizer.js';
import fs from 'fs';

const parser = new MarkdownParser();
const normalizer = new Normalizer();
const text = fs.readFileSync('./content/articles/workflow-design-and-the-human-element.md', 'utf8');

const parsed = parser.parse(text);
console.log("Raw tags:", parsed.metadata.tags);
console.log("Type of raw tags:", typeof parsed.metadata.tags);
console.log("Is array:", Array.isArray(parsed.metadata.tags));

const normalized = normalizer.normalize(parsed, '/content/articles/workflow-design-and-the-human-element.md');
console.log("Normalized tags:", normalized.metadata.tags);
