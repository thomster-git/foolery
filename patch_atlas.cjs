const fs = require('fs');

const atlasPath = 'website/static/js/atlas.js';
let atlas = fs.readFileSync(atlasPath, 'utf8');

// Replace the focusType logic to support 'global'
let newLogic = `
  } else if (focusType === 'global') {
    const hubNode = { id: 'hub-global', label: 'Thoms Foolery', type: 'hub', url: null, summary: 'The Digital Garden' };
    const articlesNode = { id: 'hub-articles', label: 'Articles', type: 'hub', url: null, summary: 'Essays and Stories' };
    const projectsNode = { id: 'hub-projects', label: 'Projects', type: 'hub', url: null, summary: 'Code and Creations' };
    const topicsNode = { id: 'hub-topics', label: 'Topics', type: 'hub', url: '/topics/', summary: 'Browse all topics' };
    const themesNode = { id: 'hub-themes', label: 'Themes', type: 'hub', url: '/themes/', summary: 'Browse all themes' };
    
    filteredNodes = [hubNode, articlesNode, projectsNode, topicsNode, themesNode];
    filteredEdges = [
        { source: 'hub-global', target: 'hub-articles' },
        { source: 'hub-global', target: 'hub-projects' },
        { source: 'hub-global', target: 'hub-topics' },
        { source: 'hub-global', target: 'hub-themes' }
    ];
    focusId = 'hub-global';
  } else if (focusType) {
`;

atlas = atlas.replace(/} else if \(focusType\) {/, newLogic);

// Make nodes and links mutable using let
atlas = atlas.replace(/const nodes = filteredNodes\.map/g, 'let nodes = filteredNodes.map');
atlas = atlas.replace(/const nodeMap = new Map/g, 'let nodeMap = new Map');
atlas = atlas.replace(/const links = filteredEdges\.map/g, 'let links = filteredEdges.map');

// Add expansion logic inside click handler
const clickHandlerLogic = `
    // Only act on quick click without dragging (distance < 6px and duration < 300ms)
    if (hoveredNode && moveDist < 6 && clickDuration < 300) {
      if (hoveredNode.id === 'hub-articles' && focusType === 'global') {
          // Expand topics
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const topics = data.nodes.filter(n => n.type === 'topic');
              topics.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      const newNode = {
                          ...t,
                          x: hoveredNode.x + Math.cos(angle) * 30,
                          y: hoveredNode.y + Math.sin(angle) * 30,
                          vx: (Math.random() - 0.5) * 2,
                          vy: (Math.random() - 0.5) * 2,
                          radius: 10,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  } else {
                      links.push({ source: hoveredNode, target: nodeMap.get(t.id) });
                  }
              });
          }
      } else if (hoveredNode.url) {
          if (drawerTypes.has(hoveredNode.type)) {
              openNodeDrawer(hoveredNode);
          } else {
              window.location.href = hoveredNode.url;
          }
      }
    }
`;

atlas = atlas.replace(/\/\/ Only act on quick click without dragging \(distance < 6px and duration < 300ms\)[\s\S]*?if \(drawerTypes\.has\(hoveredNode\.type\)\) {[\s\S]*?openNodeDrawer\(hoveredNode\);[\s\S]*?} else {[\s\S]*?window\.location\.href = hoveredNode\.url;[\s\S]*?}[\s\S]*?}/, clickHandlerLogic.trim());

fs.writeFileSync(atlasPath, atlas);
console.log('Patched atlas.js');
