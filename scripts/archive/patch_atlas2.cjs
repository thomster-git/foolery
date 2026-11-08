const fs = require('fs');
const atlasPath = 'website/static/js/atlas.js';
let atlas = fs.readFileSync(atlasPath, 'utf8');

// Reset global mode logic
const globalSetupLogic = `  } else if (focusType === 'global') {
    const hubNode = { id: 'hub-global', label: 'Thoms Foolery', type: 'hub', url: null, summary: 'The Digital Garden' };
    const socialNode = { id: 'hub-social', label: 'Social Media', type: 'hub', url: null, summary: 'Link in Bio' };
    const articlesNode = { id: 'hub-articles', label: 'Articles', type: 'hub', url: null, summary: 'Essays and Stories' };
    const projectsNode = { id: 'hub-projects', label: 'Projects', type: 'hub', url: '/projects/', summary: 'Code and Creations' };
    
    filteredNodes = [hubNode, socialNode, articlesNode, projectsNode];
    filteredEdges = [
        { source: 'hub-global', target: 'hub-social' },
        { source: 'hub-global', target: 'hub-articles' },
        { source: 'hub-global', target: 'hub-projects' }
    ];
    focusId = 'hub-global';
  } else if (focusType) {`;

atlas = atlas.replace(/  } else if \(focusType === 'global'\) {[\s\S]*?} else if \(focusType\) {/, globalSetupLogic);

const newClickHandlerLogic = `
    // Only act on quick click without dragging (distance < 6px and duration < 300ms)
    if (hoveredNode && moveDist < 6 && clickDuration < 300) {
      if (hoveredNode.id === 'hub-social' && focusType === 'global') {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const socials = [
                  { id: 'social-twitter', label: 'Twitter', type: 'website', url: 'https://twitter.com/', radius: 10 },
                  { id: 'social-twitch', label: 'Twitch', type: 'website', url: 'https://twitch.tv/', radius: 10 },
                  { id: 'social-github', label: 'GitHub', type: 'website', url: 'https://github.com/', radius: 10 }
              ];
              socials.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      const newNode = {
                          ...t,
                          x: hoveredNode.x + Math.cos(angle) * 30,
                          y: hoveredNode.y + Math.sin(angle) * 30,
                          vx: (Math.random() - 0.5) * 5,
                          vy: (Math.random() - 0.5) * 5,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  }
              });
          }
      } else if (hoveredNode.id === 'hub-articles' && focusType === 'global') {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const topics = data.nodes.filter(n => n.type === 'topic');
              topics.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      let targetUrl = t.url || \`/topics/\${t.id}.html\`;
                      const newNode = {
                          ...t,
                          url: targetUrl,
                          x: hoveredNode.x + Math.cos(angle) * 30,
                          y: hoveredNode.y + Math.sin(angle) * 30,
                          vx: (Math.random() - 0.5) * 5,
                          vy: (Math.random() - 0.5) * 5,
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

atlas = atlas.replace(/\/\/ Only act on quick click without dragging \(distance < 6px and duration < 300ms\)[\s\S]*?if \(drawerTypes\.has\(hoveredNode\.type\)\) {[\s\S]*?openNodeDrawer\(hoveredNode\);[\s\S]*?} else {[\s\S]*?window\.location\.href = hoveredNode\.url;[\s\S]*?}[\s\S]*?}/, newClickHandlerLogic.trim());

fs.writeFileSync(atlasPath, atlas);
console.log('Patched atlas.js again');
