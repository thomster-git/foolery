const fs = require('fs');
const path = require('path');

const contentDir = path.resolve(__dirname, 'content/library');

// Ensure tv-shows dir exists
const tvShowsDir = path.join(contentDir, 'tv-shows');
if (!fs.existsSync(tvShowsDir)) fs.mkdirSync(tvShowsDir);

const files = [
  {
    path: 'tv-shows/south-park.md',
    id: 'south-park',
    title: 'South Park',
    type: 'tv-show',
    status: 'active',
    summary: 'A satirical animated sitcom following the misadventures of four foul-mouthed boys in a small Colorado town.',
    topics: ['internet-culture'],
    themes: ['worldview'],
    tags: ['comedy', 'satire', 'animation'],
    related: []
  },
  {
    path: 'tv-shows/how-i-met-your-mother.md',
    id: 'how-i-met-your-mother',
    title: 'How I Met Your Mother',
    type: 'tv-show',
    status: 'active',
    summary: 'A sitcom revolving around Ted Mosby and his group of friends in New York City, as he recounts the story of how he met his childrens mother.',
    topics: ['personal-growth'],
    themes: ['connection', 'lifestyle'],
    tags: ['sitcom', 'comedy', 'romance'],
    related: []
  },
  {
    path: 'tv-shows/blue-mountain-state.md',
    id: 'blue-mountain-state',
    title: 'Blue Mountain State',
    type: 'tv-show',
    status: 'active',
    summary: 'A comedy series focusing on the off-field antics of a fictional university football team, the Mountain Goats.',
    topics: ['internet-culture'],
    themes: ['lifestyle'],
    tags: ['comedy', 'sports', 'college'],
    related: []
  },
  {
    path: 'tv-shows/naruto.md',
    id: 'naruto',
    title: 'Naruto',
    type: 'tv-show',
    status: 'active',
    summary: 'A Japanese manga and anime series following Naruto Uzumaki, a young ninja who seeks recognition and dreams of becoming the Hokage.',
    topics: ['personal-growth'],
    themes: ['connection', 'worldview'],
    tags: ['anime', 'action', 'adventure'],
    related: []
  },
  {
    path: 'tv-shows/bluey.md',
    id: 'bluey',
    title: 'Bluey (2018)',
    type: 'tv-show',
    status: 'active',
    summary: 'An Australian animated preschool television series that follows Bluey, an anthropomorphic six-year-old Blue Heeler puppy.',
    topics: ['family'],
    themes: ['childhood', 'connection'],
    tags: ['animation', 'family', 'parenting'],
    related: ['my-story-with-potty-training-and-parenting']
  },
  {
    path: 'tv-shows/code-geass.md',
    id: 'code-geass',
    title: 'Code Geass',
    type: 'tv-show',
    status: 'active',
    summary: 'A Japanese anime series set in an alternate timeline where the exiled prince Lelouch vi Britannia obtains the power of absolute obedience.',
    topics: ['politics'],
    themes: ['worldview'],
    tags: ['anime', 'mecha', 'thriller'],
    related: []
  },
  {
    path: 'tv-shows/breaking-bad.md',
    id: 'breaking-bad',
    title: 'Breaking Bad',
    type: 'tv-show',
    status: 'wishlist',
    summary: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    topics: ['personal-growth'],
    themes: ['worldview'],
    tags: ['drama', 'crime', 'thriller'],
    related: []
  },
  {
    path: 'tv-shows/sons-of-anarchy.md',
    id: 'sons-of-anarchy',
    title: 'Sons of Anarchy',
    type: 'tv-show',
    status: 'wishlist',
    summary: 'An action crime drama series following the lives of a close-knit outlaw motorcycle club operating in Charming, a fictional town in California.',
    topics: ['personal-growth'],
    themes: ['connection'],
    tags: ['drama', 'crime', 'action'],
    related: []
  },
  {
    path: 'companies/burin-peninsula-regional-service-board.md',
    id: 'burin-peninsula-regional-service-board',
    title: 'Burin Peninsula Regional Service Board',
    type: 'company',
    status: 'active',
    summary: 'Waste management services for the Burin Peninsula. They are incredibly easy to deal with for dump runs and provide an excellent service experience.',
    topics: ['infrastructure'],
    themes: ['community'],
    tags: ['waste-management', 'services', 'local'],
    related: [],
    url: 'http://www.burinpenwaste.com/',
    content: 'Excellent website and service. I use them for my dump runs and they never give me a hard time. Very quick and easy process.'
  },
  {
    path: 'companies/royal-canadian-cadets.md',
    id: 'royal-canadian-cadets',
    title: 'Royal Canadian Cadets (Air)',
    type: 'company',
    status: 'active',
    summary: 'A national youth program for Canadians aged 12 to 18. The opportunities they provide young people are phenomenal.',
    topics: ['personal-growth', 'aviation'],
    themes: ['community', 'childhood'],
    tags: ['cadets', 'youth-program', 'aviation'],
    related: [],
    content: 'The Royal Canadian Air Cadets provided me with phenomenal opportunities during my youth. It is an excellent organization for young people.'
  },
  {
    path: 'websites/x-twitter.md',
    id: 'x-twitter',
    title: 'X (Twitter)',
    type: 'website',
    status: 'active',
    summary: 'A social media platform that, despite being toxic at times, remains the best for live interacting with a large audience and catching up on events.',
    topics: ['internet-culture'],
    themes: ['connection', 'worldview'],
    tags: ['social-media', 'news', 'platform'],
    related: []
  },
  {
    path: 'websites/imag-r.md',
    id: 'imag-r',
    title: 'imag-R',
    type: 'website',
    status: 'active',
    summary: 'A very useful website/tool for laser engraving. It processes uploaded photos based on the selected material to provide a better version for higher quality final products.',
    topics: ['making'],
    themes: ['creativity'],
    tags: ['laser-engraving', 'image-processing', 'tool'],
    related: ['my-story-with-3d-printing-and-laser-engraving', 'my-story-with-etchcentric-and-laser-engraving'],
    url: 'https://imag-r.com'
  },
  {
    path: 'websites/pricecharting.md',
    id: 'pricecharting',
    title: 'PriceCharting',
    type: 'website',
    status: 'active',
    summary: 'A platform for keeping track of collections and checking comps (comparable prices) for various collectibles and video games.',
    topics: ['collecting'],
    themes: ['curiosity'],
    tags: ['tracking', 'collections', 'prices'],
    related: ['collecting'],
    url: 'https://www.pricecharting.com/'
  },
  {
    path: 'websites/lichess.md',
    id: 'lichess',
    title: 'Lichess',
    type: 'website',
    status: 'active',
    summary: 'A free, open-source chess server. It is incredibly powerful and feature-rich, though slightly less user-friendly than some commercial alternatives.',
    topics: ['gaming'],
    themes: ['curiosity'],
    tags: ['chess', 'open-source', 'gaming'],
    related: [],
    url: 'https://lichess.org'
  },
  {
    path: 'websites/chess-com.md',
    id: 'chess-com',
    title: 'Chess.com',
    type: 'website',
    status: 'active',
    summary: 'A commercial chess server and social networking website. Known for its excellent user experience and massive player base.',
    topics: ['gaming'],
    themes: ['curiosity', 'connection'],
    tags: ['chess', 'gaming', 'social'],
    related: [],
    url: 'https://chess.com'
  },
  {
    path: 'creators/jonnie-candito.md',
    id: 'jonnie-candito',
    title: 'Jonnie Candito',
    type: 'creator',
    status: 'active',
    summary: 'An OG in YouTube fitness. Authentic, highly knowledgeable, and a staple in the online powerlifting and fitness community.',
    topics: ['fitness'],
    themes: ['lifestyle'],
    tags: ['fitness', 'youtube', 'powerlifting'],
    related: ['my-story-with-lifting-and-sensory-regulation']
  },
  {
    path: 'creators/danny-go.md',
    id: 'danny-go',
    title: 'Danny Go!',
    type: 'creator',
    status: 'active',
    summary: 'A great child entertainment channel featuring energetic songs, dances, and learning activities.',
    topics: ['family'],
    themes: ['childhood', 'connection'],
    tags: ['youtube', 'children', 'entertainment'],
    related: ['my-story-with-potty-training-and-parenting']
  }
];

files.forEach(file => {
  const fullPath = path.join(contentDir, file.path);
  let frontmatter = `---
id: ${file.id}
title: "${file.title}"
type: ${file.type}
status: ${file.status}
summary: "${file.summary.replace(/"/g, '\\"')}"
`;
  if (file.url) {
    frontmatter += `url: "${file.url}"\n`;
  }
  
  if (file.topics.length > 0) {
    frontmatter += `topics:\n${file.topics.map(t => `  - ${t}`).join('\n')}\n`;
  }
  if (file.themes.length > 0) {
    frontmatter += `themes:\n${file.themes.map(t => `  - ${t}`).join('\n')}\n`;
  }
  if (file.tags.length > 0) {
    frontmatter += `tags:\n${file.tags.map(t => `  - ${t}`).join('\n')}\n`;
  }
  if (file.related.length > 0) {
    frontmatter += `related:\n${file.related.map(t => `  - ${t}`).join('\n')}\n`;
  }
  frontmatter += `---\n\n`;
  
  if (file.content) {
    frontmatter += `# ${file.title}\n\n${file.content}\n`;
  } else {
    frontmatter += `# ${file.title}\n\n${file.summary}\n`;
  }

  fs.writeFileSync(fullPath, frontmatter);
  console.log(`Created ${file.path}`);
});
