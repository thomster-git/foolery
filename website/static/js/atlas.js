/**
 * Project Atlas — Interactive Client Script
 * Features:
 *  1. Interactive Knowledge Graph Engine (Canvas rendering with dragging, tooltips, and click navigation)
 *  2. Real-Time Client Search Engine (Keyboard shortcuts /, Ctrl+K, search.json querying)
 *  3. Node Context Drawer (Slide-in panel for stub nodes: topics, themes, library items)
 */

document.addEventListener("DOMContentLoaded", () => {
  initGraphViewer();
  initSearchEngine();
  initMemberPaywallAuth();
  initAudioPlayer();
  initThemeSwitcher();
  initNodeDrawer();
  initImageLightbox();
});

/* ============================================================
   1. Interactive Knowledge Graph Engine
   ============================================================ */

async function initGraphViewer() {
  const container = document.getElementById("graph-canvas");
  if (!container) return;

  const getValidAttr = (attr) => {
    const val = container.getAttribute(attr);
    return (val && !val.includes("{{")) ? val : null;
  };

  const focusId = getValidAttr("data-focus-id");
  const focusType = getValidAttr("data-focus-type");
  const focusTag = getValidAttr("data-focus-tag");

  try {
    const res = await fetch("/graph.json");
    if (!res.ok) return;
    const graphData = await res.json();

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    renderCanvasGraph(container, graphData, focusId, focusType, focusTag);
  } catch (err) {
    console.error("Failed to render Knowledge Graph:", err);
  }
}

function renderCanvasGraph(container, data, focusId = null, focusType = null, focusTag = null) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  container.appendChild(canvas);

  // Tooltip element
  const tooltip = document.createElement("div");
  tooltip.className = "graph-tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  tooltip.style.background = "rgba(19, 27, 46, 0.95)";
  tooltip.style.border = "1px solid #38bdf8";
  tooltip.style.borderRadius = "8px";
  tooltip.style.padding = "8px 12px";
  tooltip.style.color = "#fff";
  tooltip.style.fontSize = "12px";
  tooltip.style.zIndex = "10";
  tooltip.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
  container.appendChild(tooltip);

  let width = (canvas.width = container.clientWidth || 800);
  let height = (canvas.height = container.clientHeight || 600);

  window.addEventListener("resize", () => {
    width = canvas.width = container.clientWidth || 800;
    height = canvas.height = container.clientHeight || 600;
  });

  const searchInput = document.getElementById("graph-search");
  let searchQuery = "";
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (e.key === "Enter" && searchQuery) {
        const match = nodes.find(n => n.label?.toLowerCase().includes(searchQuery) || n.id.toLowerCase().includes(searchQuery));
        if (match) {
            hoveredNode = match;
            match.x = width / 2;
            match.y = height / 2;
        }
      }
    });
  }

  const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"];

  // Filter for local neighborhood graph if focusId, focusType, or focusTag is specified
  let filteredNodes = data.nodes;
  let filteredEdges = data.edges || [];

  if (focusId) {
    const connectedNodeIds = new Set([focusId]);
    filteredEdges.forEach(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      if (from === focusId) connectedNodeIds.add(to);
      if (to === focusId) connectedNodeIds.add(from);
    });

    filteredNodes = data.nodes.filter(n => connectedNodeIds.has(n.id));
    filteredEdges = filteredEdges.filter(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return connectedNodeIds.has(from) && connectedNodeIds.has(to);
    });
  } else if (focusTag) {
    const tagNodeId = `tag-${focusTag}`;
    const connectedNodeIds = new Set([tagNodeId]);
    filteredEdges.forEach(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      if (from === tagNodeId) connectedNodeIds.add(to);
      if (to === tagNodeId) connectedNodeIds.add(from);
    });

    filteredNodes = data.nodes.filter(n => connectedNodeIds.has(n.id));
    filteredEdges = filteredEdges.filter(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return connectedNodeIds.has(from) && connectedNodeIds.has(to);
    });
  
  } else if (focusType === 'full') {
    const hubNode = { id: 'hub-global', label: 'Thoms Foolery', type: 'hub', url: null, summary: 'The Digital Garden' };
    filteredNodes = [hubNode];
    filteredEdges = [];
    focusId = 'hub-global';
  } else if (focusType === 'global') {
    const hubNode = { id: 'hub-global', label: 'Thoms Foolery', type: 'hub', url: null, summary: 'The Digital Garden' };
    
    // Core Philosophy & Life
    const coreValuesNode = { id: 'hub-core-values', label: 'Core Values', type: 'hub', url: null, summary: 'Philosophy and Beliefs' };
    const passionsNode = { id: 'hub-passions', label: 'Passions', type: 'hub', url: null, summary: 'Interests and Hobbies' };
    const lifeExperiencesNode = { id: 'hub-life-experiences', label: 'Life Experiences', type: 'hub', url: null, summary: 'Growth and History' };
    const connectionsNode = { id: 'hub-connections', label: 'Social Media', type: 'hub', url: null, summary: 'Find me around the web' };
    
    // Thematic Areas
    const libraryNode = { id: 'hub-library', label: 'The Library', type: 'hub', url: null, summary: 'Knowledge and Books' };
    const workshopNode = { id: 'hub-workshop', label: 'The Workshop', type: 'hub', url: null, summary: 'Software and Code' };
    const forgeNode = { id: 'hub-forge', label: 'The Forge', type: 'hub', url: '/projects/', summary: 'Projects and Builds' };
    const rabbitHoleNode = { id: 'hub-rabbit-hole', label: 'The Rabbit Hole', type: 'hub', url: null, summary: 'Fixations and Deep Dives' };
    const soapboxNode = { id: 'hub-soapbox', label: 'The Soapbox', type: 'hub', url: null, summary: 'Candid and Unfiltered' };
    const blueprintsNode = { id: 'hub-blueprints', label: 'The Blueprint Room', type: 'hub', url: null, summary: 'Systems and Workflows' };
    const archiveNode = { id: 'hub-archive', label: 'Career File', type: 'hub', url: '/resume/', summary: 'Work History and Skills' };
    
    filteredNodes = [
        hubNode, coreValuesNode, passionsNode, lifeExperiencesNode, connectionsNode,
        libraryNode, workshopNode, forgeNode, rabbitHoleNode, soapboxNode, blueprintsNode, archiveNode
    ];
    
    filteredEdges = [
        { source: 'hub-global', target: 'hub-core-values' },
        { source: 'hub-global', target: 'hub-passions' },
        { source: 'hub-global', target: 'hub-life-experiences' },
        { source: 'hub-global', target: 'hub-connections' },
        { source: 'hub-global', target: 'hub-library' },
        { source: 'hub-global', target: 'hub-workshop' },
        { source: 'hub-global', target: 'hub-forge' },
        { source: 'hub-global', target: 'hub-rabbit-hole' },
        { source: 'hub-global', target: 'hub-soapbox' },
        { source: 'hub-global', target: 'hub-blueprints' },
        { source: 'hub-global', target: 'hub-archive' }
    ];
    focusId = 'hub-global';
  } else if (focusType) {

    let baseNodes;
    let hubTitle = "Hub";
    if (focusType === "library") {
      // For Library, only connect the library-category hubs to the main Library hub
      baseNodes = data.nodes.filter(n => n.type === 'library-category');
      hubTitle = "Library";
    } else {
      baseNodes = data.nodes.filter(n => n.type === focusType);
      hubTitle = focusType.charAt(0).toUpperCase() + focusType.slice(1) + (focusType.endsWith('s') ? '' : 's');
    }
    
    // Create a central Hub Node
    const hubNodeId = `hub-${focusType}`;
    const hubNode = {
      id: hubNodeId,
      label: hubTitle,
      type: "hub",
      url: `/${focusType === 'library' ? 'library' : focusType + 's'}/`,
      summary: `Central hub for all ${hubTitle}`
    };
    
    filteredNodes = [...baseNodes, hubNode];
    
    // Create direct edges from hub to all baseNodes
    filteredEdges = baseNodes.map(n => ({
      source: hubNodeId,
      target: n.id,
      relation: 'hub-connection'
    }));
    
    // Set focus to the central hub
    focusId = hubNodeId;
  }

  // Assign initial 2D layout positions
  let nodes = filteredNodes.map((n, i) => {
    const isFocused = n.id === focusId;
    const angle = (i / filteredNodes.length) * Math.PI * 2;
    const radius = isFocused ? 0 : (50 + Math.random() * 30);

    let targetUrl = n.url;
    if (!targetUrl) {
      targetUrl = libraryTypes.includes(n.type) ? `/library/${n.type}s/${n.id}.html` : `/${n.type}s/${n.id}.html`;
    }

    return {
      ...n,
      url: targetUrl,
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      vx: isFocused ? 0 : (Math.random() - 0.5) * 0.4,
      vy: isFocused ? 0 : (Math.random() - 0.5) * 0.4,
      radius: isFocused ? 20 : n.type === "hub" ? 16 : n.type === "article" ? 10 : n.type === "topic" ? 12 : 8,
      isFocused
    };
  });

  let nodeMap = new Map(nodes.map(n => [n.id, n]));
  let links = filteredEdges.map(e => ({
    source: nodeMap.get(e.source || e.from),
    target: nodeMap.get(e.target || e.to)
  })).filter(l => l.source && l.target);

  let hoveredNode = null;
  let draggedNode = null;
  let mouseDownTime = 0;
  let mouseDownPos = { x: 0, y: 0 };
  let isDraggingNode = false;

  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    mouseDownTime = Date.now();
    mouseDownPos = { x: e.clientX, y: e.clientY };
    isDraggingNode = false;

    draggedNode = nodes.find(n => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) < n.radius + 20;
    });
  });

  // Types that open the drawer panel instead of full-page navigation
  const drawerTypes = new Set(["topic", "theme", "collection", "book", "hardware", "tool", "creator", "game", "service", "software", "website", "project", "library"]);

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const moveDist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
    if (moveDist > 5) {
      isDraggingNode = true;
    }

    if (draggedNode) {
      const prevX = draggedNode.x;
      const prevY = draggedNode.y;
      draggedNode.x = mx;
      draggedNode.y = my;

      const deltaX = draggedNode.x - prevX;
      const deltaY = draggedNode.y - prevY;

      // Elastic Spring Propagation to directly connected neighbor nodes
      links.forEach(l => {
        if (l.source === draggedNode) {
          l.target.x += deltaX * 0.35;
          l.target.y += deltaY * 0.35;
        } else if (l.target === draggedNode) {
          l.source.x += deltaX * 0.35;
          l.source.y += deltaY * 0.35;
        }
      });
    }

    hoveredNode = nodes.find(n => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) < n.radius + 20;
    });

    canvas.style.cursor = hoveredNode ? (isDraggingNode ? "grabbing" : "pointer") : "default";

    if (hoveredNode && !isDraggingNode) {
      tooltip.style.display = "block";
      tooltip.style.left = (mx + 15) + "px";
      tooltip.style.top = (my - 10) + "px";
      const isDrawerType = drawerTypes && drawerTypes.has(hoveredNode.type);
      tooltip.innerHTML = `
        <div style="font-weight:600; color:#38bdf8;">${escapeHtml(hoveredNode.label || hoveredNode.id)}</div>
        <div style="font-size:10px; text-transform:uppercase; color:#818cf8; margin-top:2px;">${escapeHtml(hoveredNode.type)}</div>
        ${hoveredNode.summary ? `<div style="font-size:11px; color:#94a3b8; margin-top:4px;">${escapeHtml(hoveredNode.summary.slice(0, 90))}...</div>` : ''}
        <div style="font-size:10px; color:#34d399; margin-top:6px;">${isDrawerType ? 'Preview in panel ↗' : 'Click to view page →'}</div>
      `;
    } else {
      tooltip.style.display = "none";
    }
  });

  window.addEventListener("mouseup", () => {
    draggedNode = null;
  });

  canvas.addEventListener("click", (e) => {
    const clickDuration = Date.now() - mouseDownTime;
    const moveDist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);

    // Only act on quick click without dragging (distance < 15px and duration < 800ms)
    if (hoveredNode && moveDist < 15 && clickDuration < 800) {
      if (hoveredNode.id === 'hub-global' && focusType === 'global') {
          window.location.href = '/articles/manifesto.html';
      } else if (hoveredNode.id === 'hub-global' && focusType === 'full') {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const branches = [
                  { id: 'hub-core-values', label: 'Core Values', type: 'hub', url: null, summary: 'Philosophy and Beliefs', radius: 16 },
                  { id: 'hub-passions', label: 'Passions', type: 'hub', url: null, summary: 'Interests and Hobbies', radius: 16 },
                  { id: 'hub-life-experiences', label: 'Life Experiences', type: 'hub', url: null, summary: 'Growth and History', radius: 16 },
                  { id: 'hub-workshop', label: 'The Workshop', type: 'hub', url: null, summary: 'Projects and Tech', radius: 16 },
                  { id: 'hub-library', label: 'The Library', type: 'hub', url: null, summary: 'Knowledge and Books', radius: 16 },
                  { id: 'hub-connections', label: 'Social Media', type: 'hub', url: null, summary: 'Find me around the web', radius: 16 }
              ];
              branches.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      const newNode = {
                          ...t,
                          x: hoveredNode.x + Math.cos(angle) * 150,
                          y: hoveredNode.y + Math.sin(angle) * 150,
                          vx: (Math.random() - 0.5) * 0.5,
                          vy: (Math.random() - 0.5) * 0.5,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  }
              });
          } else {
              hoveredNode.expanded = false;
          const branchIds = ['hub-core-values', 'hub-passions', 'hub-life-experiences', 'hub-workshop', 'hub-library', 'hub-connections'];
              nodes = nodes.filter(n => !branchIds.includes(n.id));
              links = links.filter(l => !branchIds.includes(l.source.id) && !branchIds.includes(l.target.id));
              branchIds.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-connections' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const socials = [
                  { id: 'social-twitter', label: 'X / Twitter', type: 'website', url: 'https://x.com/ThomsFoolery', radius: 10 },
                  { id: 'social-twitch', label: 'Twitch', type: 'website', url: 'https://www.twitch.tv/thomsfooiery', radius: 10 },
                  { id: 'social-youtube', label: 'YouTube', type: 'website', url: 'https://www.youtube.com/@Thoms.Foolery', radius: 10 },
                  { id: 'social-linkedin', label: 'LinkedIn', type: 'website', url: 'https://www.linkedin.com/in/jonathan-thoms-a43b65a4/', radius: 10 },
                  { id: 'social-discord', label: 'Discord', type: 'website', url: 'https://discord.gg/84c7ut6cg6', radius: 10 }
              ];
              socials.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      const newNode = {
                          ...t,
                          x: hoveredNode.x + Math.cos(angle) * 100,
                          y: hoveredNode.y + Math.sin(angle) * 100,
                          vx: (Math.random() - 0.5) * 0.5,
                          vy: (Math.random() - 0.5) * 0.5,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  }
              });
          } else {
              hoveredNode.expanded = false;
              const socialIds = ['social-twitter', 'social-twitch', 'social-youtube', 'social-linkedin', 'social-discord'];
              nodes = nodes.filter(n => !socialIds.includes(n.id));
              links = links.filter(l => !socialIds.includes(l.source.id) && !socialIds.includes(l.target.id));
              socialIds.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-core-values' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const topicIds = ['politics', 'gender-studies', 'worldview', 'philosophy'];
              const nodesToSpawn = data.nodes.filter(n => topicIds.includes(n.id));
              // Also add the manifesto
              nodesToSpawn.push({
                  id: 'manifesto-node', label: 'The Manifesto', type: 'article', url: '/articles/manifesto.html', radius: 12
              });
              nodesToSpawn.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      let targetUrl = t.url || `/topics/${t.id}.html`;
                      const newNode = {
                          ...t,
                          url: targetUrl,
                          x: hoveredNode.x + Math.cos(angle) * 180,
                          y: hoveredNode.y + Math.sin(angle) * 180,
                          vx: (Math.random() - 0.5) * 0.66,
                          vy: (Math.random() - 0.5) * 0.66,
                          radius: 12,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  } else {
                      links.push({ source: hoveredNode, target: nodeMap.get(t.id) });
                  }
              });
          } else {
              hoveredNode.expanded = false;
              const spawnIds = ['politics', 'gender-studies', 'worldview', 'philosophy', 'manifesto-node'];
              nodes = nodes.filter(n => !spawnIds.includes(n.id));
              links = links.filter(l => !spawnIds.includes(l.source.id) && !spawnIds.includes(l.target.id));
              spawnIds.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-workshop' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const projectNodes = [
                  { id: 'proj-active', label: 'Active Projects', type: 'project', url: '/projects/#active', radius: 10, summary: 'Current projects in active development' },
                  { id: 'proj-drawing', label: 'Drawing Board', type: 'project', url: '/projects/#drawing-board', radius: 10, summary: 'Concepts and ideas in the early stages' },
                  { id: 'proj-completed', label: 'Case Studies', type: 'project', url: '/projects/#case-studies', radius: 10, summary: 'Completed projects and post-mortems' }
              ];
              const topicIds = ['technology', 'self-hosting', 'home-lab', 'homelab'];
              const topics = data.nodes.filter(n => topicIds.includes(n.id));
              const nodesToSpawn = [...projectNodes, ...topics];
              
              nodesToSpawn.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      let targetUrl = t.url || `/topics/${t.id}.html`;
                      const newNode = {
                          ...t,
                          url: targetUrl,
                          x: hoveredNode.x + Math.cos(angle) * 160,
                          y: hoveredNode.y + Math.sin(angle) * 160,
                          vx: (Math.random() - 0.5) * 0.5,
                          vy: (Math.random() - 0.5) * 0.5,
                          radius: t.type === 'topic' ? 12 : 10,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  } else {
                      links.push({ source: hoveredNode, target: nodeMap.get(t.id) });
                  }
              });
          } else {
              hoveredNode.expanded = false;
              const spawnIds = ['proj-active', 'proj-drawing', 'proj-completed', 'technology', 'self-hosting', 'home-lab', 'homelab'];
              nodes = nodes.filter(n => !spawnIds.includes(n.id));
              links = links.filter(l => !spawnIds.includes(l.source.id) && !spawnIds.includes(l.target.id));
              spawnIds.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-passions' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const topicIds = ['photography', 'audio-engineering', 'baseball', 'gaming', 'collecting', 'drawing', 'music', 'video-editing'];
              const nodesToSpawn = data.nodes.filter(n => topicIds.includes(n.id));
              nodesToSpawn.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      let targetUrl = t.url || `/topics/${t.id}.html`;
                      const newNode = {
                          ...t,
                          url: targetUrl,
                          x: hoveredNode.x + Math.cos(angle) * 150,
                          y: hoveredNode.y + Math.sin(angle) * 150,
                          vx: (Math.random() - 0.5) * 0.5,
                          vy: (Math.random() - 0.5) * 0.5,
                          radius: 12,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  } else {
                      links.push({ source: hoveredNode, target: nodeMap.get(t.id) });
                  }
              });
          } else {
              hoveredNode.expanded = false;
              const topicIds = ['photography', 'audio-engineering', 'baseball', 'gaming', 'collecting', 'drawing', 'music', 'video-editing'];
              nodes = nodes.filter(n => !topicIds.includes(n.id));
              links = links.filter(l => !topicIds.includes(l.source.id) && !topicIds.includes(l.target.id));
              topicIds.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-life-experiences' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const topicIds = ['audhd', 'health-and-fitness', 'career', 'parenting'];
              const topics = data.nodes.filter(n => topicIds.includes(n.id));
              const shitList = data.nodes.filter(n => n.type === 'shit-list');
              const nodesToSpawn = [...topics, ...shitList];
              
              nodesToSpawn.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      let targetUrl = t.url || `/topics/${t.id}.html`; // shit-list nodes usually have t.url
                      const newNode = {
                          ...t,
                          url: targetUrl,
                          x: hoveredNode.x + Math.cos(angle) * 170,
                          y: hoveredNode.y + Math.sin(angle) * 170,
                          vx: (Math.random() - 0.5) * 0.6,
                          vy: (Math.random() - 0.5) * 0.6,
                          radius: t.type === 'topic' ? 12 : 10,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  } else {
                      links.push({ source: hoveredNode, target: nodeMap.get(t.id) });
                  }
              });
              // Store what we added so we can collapse it later
              hoveredNode.spawnedIds = nodesToSpawn.map(n => n.id);
          } else {
              hoveredNode.expanded = false;
              const toRemove = hoveredNode.spawnedIds || [];
              nodes = nodes.filter(n => !toRemove.includes(n.id));
              links = links.filter(l => !toRemove.includes(l.source.id) && !toRemove.includes(l.target.id));
              toRemove.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-library' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const libraryNodes = [
                  { id: 'lib-books', label: 'Books', type: 'library', url: '/library/#books', radius: 10, summary: 'Books I have read or am reading' },
                  { id: 'lib-hardware', label: 'Hardware', type: 'library', url: '/library/#hardware', radius: 10, summary: 'Physical tools and equipment' },
                  { id: 'lib-software', label: 'Software', type: 'library', url: '/library/#software', radius: 10, summary: 'Apps and programs I use' },
                  { id: 'lib-tools', label: 'Tools', type: 'library', url: '/library/#tools', radius: 10, summary: 'Digital and physical utilities' },
                  { id: 'lib-games', label: 'Games', type: 'library', url: '/library/#games', radius: 10, summary: 'Video games and board games' },
                  { id: 'lib-creators', label: 'Creators', type: 'library', url: '/library/#creators', radius: 10, summary: 'People who inspire me' }
              ];
              libraryNodes.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      const newNode = {
                          ...t,
                          x: hoveredNode.x + Math.cos(angle) * 120,
                          y: hoveredNode.y + Math.sin(angle) * 120,
                          vx: (Math.random() - 0.5) * 0.5,
                          vy: (Math.random() - 0.5) * 0.5,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  }
              });
          } else {
              hoveredNode.expanded = false;
              const libIds = ['lib-books', 'lib-hardware', 'lib-software', 'lib-tools', 'lib-games', 'lib-creators'];
              nodes = nodes.filter(n => !libIds.includes(n.id));
              links = links.filter(l => !libIds.includes(l.source.id) && !libIds.includes(l.target.id));
              libIds.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-soapbox' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const soapboxNodes = [
                  { id: 'soapbox-shit-list', label: 'The Shit List', type: 'project', url: '/shit-list/', radius: 12, summary: 'Companies and people who have earned their place on the list' },
                  { id: 'soapbox-opinions', label: 'Opinions & Rants', type: 'article', url: '/articles/', radius: 12, summary: 'Hot takes and unfiltered commentary' }
              ];
              soapboxNodes.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      const newNode = {
                          ...t,
                          x: hoveredNode.x + Math.cos(angle) * 120,
                          y: hoveredNode.y + Math.sin(angle) * 120,
                          vx: (Math.random() - 0.5) * 0.5,
                          vy: (Math.random() - 0.5) * 0.5,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  }
              });
          } else {
              hoveredNode.expanded = false;
              const soapboxIds = ['soapbox-shit-list', 'soapbox-opinions'];
              nodes = nodes.filter(n => !soapboxIds.includes(n.id));
              links = links.filter(l => !soapboxIds.includes(l.source.id) && !soapboxIds.includes(l.target.id));
              soapboxIds.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-rabbit-hole' && (focusType === 'global' || focusType === 'full')) {
          if (!hoveredNode.expanded) {
              hoveredNode.expanded = true;
              const topicIds = ['gaming', 'baseball', 'collecting', 'music', 'photography'];
              const nodesToSpawn = data.nodes.filter(n => topicIds.includes(n.id));
              nodesToSpawn.forEach(t => {
                  if (!nodeMap.has(t.id)) {
                      const angle = Math.random() * Math.PI * 2;
                      const newNode = {
                          ...t,
                          url: t.url || `/topics/${t.id}.html`,
                          x: hoveredNode.x + Math.cos(angle) * 130,
                          y: hoveredNode.y + Math.sin(angle) * 130,
                          vx: (Math.random() - 0.5) * 0.5,
                          vy: (Math.random() - 0.5) * 0.5,
                          radius: 12,
                          isFocused: false
                      };
                      nodes.push(newNode);
                      nodeMap.set(t.id, newNode);
                      links.push({ source: hoveredNode, target: newNode });
                  } else {
                      links.push({ source: hoveredNode, target: nodeMap.get(t.id) });
                  }
              });
              hoveredNode.spawnedIds = nodesToSpawn.map(n => n.id);
          } else {
              hoveredNode.expanded = false;
              const toRemove = hoveredNode.spawnedIds || [];
              nodes = nodes.filter(n => !toRemove.includes(n.id));
              links = links.filter(l => !toRemove.includes(l.source.id) && !toRemove.includes(l.target.id));
              toRemove.forEach(id => nodeMap.delete(id));
          }
      } else if (hoveredNode.id === 'hub-resume') {
          openNodeDrawer(hoveredNode);
      } else if (hoveredNode.url) {
          if (focusType === 'full' && hoveredNode.type !== 'hub') {
              if (!hoveredNode.expanded) {
                  hoveredNode.expanded = true;
                  const connectedEdges = data.edges.filter(e => (e.source || e.from) === hoveredNode.id || (e.target || e.to) === hoveredNode.id);
                  const neighborIds = connectedEdges.map(e => (e.source || e.from) === hoveredNode.id ? (e.target || e.to) : (e.source || e.from));
                  
                  const neighbors = data.nodes.filter(n => neighborIds.includes(n.id));
                  let addedNeighbors = [];
                  neighbors.forEach(neighbor => {
                      if (!nodeMap.has(neighbor.id)) {
                          const angle = Math.random() * Math.PI * 2;
                          let targetUrl = neighbor.url;
                          if (!targetUrl) {
                              targetUrl = libraryTypes.includes(neighbor.type) ? `/library/${neighbor.type}s/${neighbor.id}.html` : `/${neighbor.type}s/${neighbor.id}.html`;
                          }
                          const newNode = {
                              ...neighbor,
                              url: targetUrl,
                              x: hoveredNode.x + Math.cos(angle) * 150,
                              y: hoveredNode.y + Math.sin(angle) * 150,
                              vx: (Math.random() - 0.5) * 1.0,
                              vy: (Math.random() - 0.5) * 1.0,
                              radius: neighbor.type === "article" ? 10 : neighbor.type === "topic" ? 12 : 8,
                              isFocused: false
                          };
                          nodes.push(newNode);
                          nodeMap.set(neighbor.id, newNode);
                          links.push({ source: hoveredNode, target: newNode });
                          addedNeighbors.push(neighbor.id);
                      } else {
                          // Connect existing nodes
                          const exists = links.some(l => (l.source === hoveredNode && l.target === nodeMap.get(neighbor.id)) || (l.target === hoveredNode && l.source === nodeMap.get(neighbor.id)));
                          if (!exists) links.push({ source: hoveredNode, target: nodeMap.get(neighbor.id) });
                      }
                  });
                  // Store what we added so we can collapse it later
                  hoveredNode.spawnedIds = addedNeighbors;
              } else {
                  hoveredNode.expanded = false;
                  const toRemove = hoveredNode.spawnedIds || [];
                  nodes = nodes.filter(n => !toRemove.includes(n.id));
                  links = links.filter(l => !toRemove.includes(l.source.id) && !toRemove.includes(l.target.id));
                  toRemove.forEach(id => nodeMap.delete(id));
              }
              // Always open the drawer if it's a drawer type
              if (drawerTypes.has(hoveredNode.type)) {
                  openNodeDrawer(hoveredNode);
              }
          } else {
              if (drawerTypes.has(hoveredNode.type)) {
                  openNodeDrawer(hoveredNode);
              } else {
                  window.location.href = hoveredNode.url;
              }
          }
      }
    }
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const activeNode = hoveredNode || draggedNode;
    const activeNeighborSet = new Set();
    if (activeNode) {
      links.forEach(l => {
        if (l.source === activeNode) activeNeighborSet.add(l.target);
        if (l.target === activeNode) activeNeighborSet.add(l.source);
      });
    }

    // Draw links
    links.forEach(l => {
      const isConnectedToActive = activeNode && (l.source === activeNode || l.target === activeNode);
      
      let isSourceMatch = false;
      let isTargetMatch = false;
      if (searchQuery) {
          isSourceMatch = (l.source.label && l.source.label.toLowerCase().includes(searchQuery)) || 
                          (l.source.id && l.source.id.toLowerCase().includes(searchQuery)) || 
                          (l.source.type && l.source.type.toLowerCase().includes(searchQuery));
          isTargetMatch = (l.target.label && l.target.label.toLowerCase().includes(searchQuery)) || 
                          (l.target.id && l.target.id.toLowerCase().includes(searchQuery)) || 
                          (l.target.type && l.target.type.toLowerCase().includes(searchQuery));
      }
      const isLinkDimmed = (activeNode && !isConnectedToActive) || (searchQuery && !(isSourceMatch || isTargetMatch));

      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);

      if (isConnectedToActive) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.95)";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = isLinkDimmed ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0.3)";
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    });
    ctx.shadowBlur = 0;

    // Sort nodes to ensure proper z-index (drawn from bottom to top)
    nodes.sort((a, b) => {
      const getLayer = n => n.id === 'hub-global' ? 3 : (n.type === 'hub' ? 2 : 1);
      return getLayer(a) - getLayer(b);
    });

    // Update & draw nodes
    nodes.forEach(n => {
      if (!n.isFocused && n !== draggedNode) {
        if (n === hoveredNode) {
            n.vx *= 0.5; // Dampen speed heavily while hovering
            n.vy *= 0.5;
        }
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 20 || n.x > width - 20) n.vx *= -1;
        if (n.y < 20 || n.y > height - 20) n.vy *= -1;
      }

      const isActive = n === activeNode;
      const isNeighbor = activeNeighborSet.has(n);
      
      let isSearchMatch = false;
      if (searchQuery) {
          isSearchMatch = (n.label && n.label.toLowerCase().includes(searchQuery)) || 
                          (n.id && n.id.toLowerCase().includes(searchQuery)) || 
                          (n.type && n.type.toLowerCase().includes(searchQuery));
      }
      
      const isDimmed = (activeNode && !isActive && !isNeighbor) || (searchQuery && !isSearchMatch);
      const isSearchHighlight = searchQuery && isSearchMatch;

      ctx.globalAlpha = isDimmed ? 0.15 : 1.0;

      const r = (isActive || isSearchHighlight) ? n.radius + 3.5 : isNeighbor ? n.radius + 1.5 : n.radius;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);

      // Get current theme from documentElement to decide colors dynamically
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const textColorPrimary = isDark ? "#ffffff" : "#0f172a";
      const textColorSecondary = isDark ? "#94a3b8" : "#475569";
      const neighborColor = "#38bdf8";

      if (isActive || isSearchHighlight) {
        ctx.fillStyle = textColorPrimary;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 22;
      } else if (isNeighbor) {
        ctx.fillStyle = neighborColor;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 14;
      } else if (n.isFocused) {
        ctx.fillStyle = neighborColor;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = n.type === "article" ? "#818cf8" : n.type === "topic" ? "#34d399" : "#c084fc";
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Node label with font expansion & contrast boost
      if (isActive) {
        ctx.fillStyle = textColorPrimary;
        ctx.font = "bold 20px Outfit, system-ui, sans-serif";
        if (isDark) {
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
      } else if (isNeighbor) {
        ctx.fillStyle = neighborColor;
        ctx.font = "bold 16px Outfit, system-ui, sans-serif";
      } else if (n.isFocused || n.type === 'hub') {
        ctx.fillStyle = textColorPrimary;
        ctx.font = "bold 16px Outfit, system-ui, sans-serif";
      } else {
        ctx.fillStyle = textColorSecondary;
        ctx.font = "14px Outfit, system-ui, sans-serif";
      }

      ctx.fillText(n.label || n.title || n.id, n.x + r + 8, n.y + 5);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ============================================================
   2. Real-Time Client Search Engine
   ============================================================ */

let searchIndexData = null;

async function initSearchEngine() {
  const trigger = document.getElementById("search-trigger");
  const modal = document.getElementById("search-modal");
  const overlay = document.getElementById("search-overlay");
  const closeBtn = document.getElementById("search-close");
  const input = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");

  if (!modal || !input) return;

  function openSearch() {
    modal.removeAttribute("hidden");
    input.focus();
    input.select();
    loadSearchIndex();
  }

  function closeSearch() {
    modal.setAttribute("hidden", "true");
    input.value = "";
    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="search-hint">Type a query to search across the entire Knowledge Graph...</div>';
    }
  }

  if (trigger) trigger.addEventListener("click", openSearch);
  if (overlay) overlay.addEventListener("click", closeSearch);
  if (closeBtn) closeBtn.addEventListener("click", closeSearch);

  // Keyboard Shortcuts: '/' or 'Ctrl+K' / 'Cmd+K'
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      openSearch();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (modal.hasAttribute("hidden")) openSearch();
      else closeSearch();
    } else if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
      closeSearch();
    }
  });

  input.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    performSearch(query, resultsContainer);
  });
}

async function loadSearchIndex() {
  if (searchIndexData) return;
  try {
    const res = await fetch("/search.json");
    if (res.ok) {
      searchIndexData = await res.json();
    }
  } catch (err) {
    console.error("Failed to load search index:", err);
  }
}

function performSearch(query, container) {
  if (!container) return;

  if (!query || query.length === 0) {
    container.innerHTML = '<div class="search-hint">Type a query to search across the entire Knowledge Graph...</div>';
    return;
  }

  if (!searchIndexData || searchIndexData.length === 0) {
    container.innerHTML = '<div class="search-hint">Loading search index...</div>';
    return;
  }

  const results = searchIndexData.filter(item => {
    const titleMatch = (item.title || "").toLowerCase().includes(query);
    const summaryMatch = (item.summary || "").toLowerCase().includes(query);
    const typeMatch = (item.type || "").toLowerCase().includes(query);
    const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(query));
    return titleMatch || summaryMatch || typeMatch || tagMatch;
  }).slice(0, 10);

  if (results.length === 0) {
    container.innerHTML = `<div class="search-hint">No results found for "${escapeHtml(query)}"</div>`;
    return;
  }

  container.innerHTML = results.map(item => {
    const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"];
    const targetUrl = item.url || (libraryTypes.includes(item.type) ? `/library/${item.type}s/${item.id}.html` : `/${item.type}s/${item.id}.html`);
    return `
    <a href="${targetUrl}" class="search-result-item">
      <div class="title">
        <span>${escapeHtml(item.title || item.id)}</span>
        <span class="type-badge">${escapeHtml(item.type || 'item')}</span>
      </div>
      <div class="summary">${escapeHtml(item.summary || '')}</div>
    </a>
  `;
  }).join("\n");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ============================================================
   3. Member Paywall Test Authentication (30-Day Token)
   ============================================================ */

function initMemberPaywallAuth(container = document) {
  const paywallCard = container.querySelector("#paywall-card");
  const gatedContent = container.querySelector("#gated-full-content");
  const unlockBtn = container.querySelector("#btn-unlock-test");
  const passInput = container.querySelector("#passcode-input");
  const authError = container.querySelector("#auth-error");
  const teaserContent = container.querySelector("#teaser-content");

  if (!paywallCard || !gatedContent) return;

  const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };

  const SECRET = "AtlasPass2026";

  const validateToken = (token) => {
    if (!token || !token.startsWith("Atlas-")) return false;
    try {
      const b64 = token.replace("Atlas-", "");
      const obj = JSON.parse(atob(b64));
      if (!obj.e || !obj.s) return false;
      
      const payload = obj.e.toString() + SECRET;
      const expectedSig = cyrb53(payload).toString(16);
      
      if (obj.s !== expectedSig) return false;
      if (Date.now() > obj.e) return false; // Expired
      
      return true;
    } catch(e) {
      return false;
    }
  };

  const storedToken = localStorage.getItem("atlas_unlocked_token");
  if (validateToken(storedToken)) {
    paywallCard.style.display = "none";
    gatedContent.classList.remove("premium-blur");
    if (teaserContent) teaserContent.style.display = "none";
    return;
  }

  // Ensure listeners are not duplicated if called multiple times on the same element
  if (unlockBtn && !unlockBtn.hasAttribute("data-listener-attached")) {
    unlockBtn.setAttribute("data-listener-attached", "true");
    unlockBtn.addEventListener("click", () => {
      const pass = passInput.value.trim();
      
      if (validateToken(pass)) {
        localStorage.setItem("atlas_unlocked_token", pass);
        paywallCard.style.display = "none";
        gatedContent.classList.remove("premium-blur");
        if (teaserContent) teaserContent.style.display = "none";
        authError.style.display = "none";
      } else {
        if (authError) {
          authError.style.display = "block";
          authError.textContent = "Invalid or expired passcode";
        }
      }
    });

    if (passInput) {
      passInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") unlockBtn.click();
      });
    }
  }
}

/* ============================================================
   4. Audio Podcast / Voice Narration Player Engine
   ============================================================ */

function initAudioPlayer() {
  const card = document.querySelector(".audio-player-card");
  if (!card) return;

  const audio = card.querySelector("audio");
  const playBtn = card.querySelector(".btn-audio-play");
  const progressBar = card.querySelector(".audio-progress-bar");
  const progressContainer = card.querySelector(".audio-progress-container");
  const timeText = card.querySelector(".audio-time");
  const speedBtn = card.querySelector(".btn-audio-speed");

  if (!audio || !playBtn) return;

  const speeds = [1, 1.25, 1.5, 2];
  let currentSpeedIdx = 0;

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(err => console.log("Audio playback error:", err));
      playBtn.textContent = "❚❚";
      playBtn.classList.add("playing");
    } else {
      audio.pause();
      playBtn.textContent = "▶";
      playBtn.classList.remove("playing");
    }
  });

  if (speedBtn) {
    speedBtn.addEventListener("click", () => {
      currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
      const speed = speeds[currentSpeedIdx];
      audio.playbackRate = speed;
      speedBtn.textContent = `${speed}x`;
    });
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressBar) progressBar.style.width = `${pct}%`;

    const curM = Math.floor(audio.currentTime / 60);
    const curS = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    const durM = Math.floor(audio.duration / 60);
    const durS = Math.floor(audio.duration % 60).toString().padStart(2, '0');
    if (timeText) timeText.textContent = `${curM}:${curS} / ${durM}:${durS}`;
  });

  if (progressContainer) {
    progressContainer.addEventListener("click", (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = pct * audio.duration;
      }
    });
  }
}

/* ============================================================
   5. Visual Theme Switcher (Obsidian / Light / Cyberpunk)
   ============================================================ */

function initThemeSwitcher() {
  const btn = document.getElementById("theme-toggle-btn");
  if (!btn) return;

  const themes = ["light", "dark"];
  const icons = { light: "☀️", dark: "🌙" };
  
  let currentTheme = localStorage.getItem("atlas_theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  btn.textContent = icons[currentTheme] || "☀️";

  btn.addEventListener("click", () => {
    const idx = (themes.indexOf(currentTheme) + 1) % themes.length;
    currentTheme = themes[idx];
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("atlas_theme", currentTheme);
    btn.textContent = icons[currentTheme] || "☀️";
  });
}



/* ============================================================
   7. Node Context Drawer
   Opens a slide-in panel for stub content types (topics, themes,
   library items) so users don't have to full-navigate to a
   near-empty page. Articles and projects navigate normally.
   ============================================================ */

function initNodeDrawer() {
  // Inject drawer HTML into the page (once)
  if (document.getElementById("node-drawer")) return;

  const drawer = document.createElement("div");
  drawer.id = "node-drawer";
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `
    <div id="node-drawer-backdrop"></div>
    <div id="node-drawer-panel">
      <div id="node-drawer-header">
        <div>
          <span id="node-drawer-badge"></span>
          <h2 id="node-drawer-title"></h2>
        </div>
        <button id="node-drawer-close" aria-label="Close panel">&times;</button>
      </div>
      <div id="node-drawer-summary"></div>
      <div id="node-drawer-scrollable" style="flex: 1; overflow-y: auto;">
        <div id="node-drawer-body"></div>
        <div id="node-drawer-related"></div>
        <a id="node-drawer-full-link" href="#">View full page &rarr;</a>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);

  document.getElementById("node-drawer-backdrop").addEventListener("click", closeNodeDrawer);
  document.getElementById("node-drawer-close").addEventListener("click", closeNodeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNodeDrawer();
  });
}

function closeNodeDrawer() {
  const drawer = document.getElementById("node-drawer");
  if (drawer) {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

async function openNodeDrawer(node) {
  const drawer = document.getElementById("node-drawer");
  if (!drawer) return;

  // Populate basic info immediately so the drawer opens fast
  document.getElementById("node-drawer-badge").textContent = node.type.charAt(0).toUpperCase() + node.type.slice(1);
  document.getElementById("node-drawer-badge").className = `drawer-badge drawer-badge--${node.type}`;
  document.getElementById("node-drawer-title").textContent = node.label || node.id;
  document.getElementById("node-drawer-summary").textContent = node.summary || "";
  document.getElementById("node-drawer-body").innerHTML = `<div class="drawer-loading">Loading content…</div>`;
  document.getElementById("node-drawer-related").innerHTML = "";
  document.getElementById("node-drawer-full-link").href = node.url;

  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (node.id === 'hub-resume') {
      document.getElementById("node-drawer-body").innerHTML = `
          <div class="drawer-content-body">
              <h3 style="color: var(--cyan); margin-bottom: 0.5rem; font-size: 1.5rem;">Jonathan Thoms</h3>
              <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">Experienced software engineer specializing in scalable architectures, AI integrations, and full-stack development.</p>
              
              <h4 style="margin-top: 1.5rem; color: #fff; margin-bottom: 0.5rem;">Key Skills</h4>
              <ul style="padding-left: 1.2rem; margin-bottom: 1.5rem; color: var(--text-muted); line-height: 1.8;">
                  <li>JavaScript / TypeScript (React, Node, D3)</li>
                  <li>Python (AI, Data Pipelines)</li>
                  <li>System Architecture & Cloud Infrastructure</li>
              </ul>
              
              <h4 style="margin-top: 1.5rem; color: #fff; margin-bottom: 0.5rem;">Recent Focus</h4>
              <p style="color: var(--text-muted); line-height: 1.6;">Currently building out Project Atlas: a graph-based digital garden interconnecting thoughts, projects, and learning.</p>
          </div>
      `;
      return;
  }

  const socialOverviews = {
      'social-twitter': { color: '#1DA1F2', title: 'X / Twitter', desc: 'Personal thoughts, AuDHD reflections, home lab experiments & maker projects.' },
      'social-twitch': { color: '#9146FF', title: 'Twitch', desc: 'Live coding, gaming, and hanging out. Come say hi in chat!' },
      'social-youtube': { color: '#FF0000', title: 'YouTube', desc: 'Video essays, project highlights, and long-form content.' },
      'social-linkedin': { color: '#0A66C2', title: 'LinkedIn', desc: 'Professional history, networking, and career updates.' },
      'social-discord': { color: '#5865F2', title: 'Discord', desc: 'Community server for the Project Atlas ecosystem. Join the discussion.' }
  };

  if (socialOverviews[node.id]) {
      const so = socialOverviews[node.id];
      document.getElementById("node-drawer-body").innerHTML = `
          <div class="drawer-content-body">
              <h3 style="color: ${so.color}; margin-bottom: 0.5rem; font-size: 1.5rem;">${so.title}</h3>
              <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${so.desc}</p>
              <a href="${node.url}" target="_blank" rel="noopener" class="btn" style="display:inline-block; margin-top:1rem; text-decoration:none; color:#fff; background:${so.color}; padding:0.5rem 1rem; border-radius:4px; font-weight:bold;">Visit ${so.title} ↗</a>
          </div>
      `;
      return;
  }

  const projectOverviews = {
      'proj-active': { title: 'Active Projects', desc: 'Projects currently in active development.', url: '/projects/#active' },
      'proj-drawing': { title: 'Drawing Board', desc: 'Concepts and ideas in the early stages of planning.', url: '/projects/#drawing-board' },
      'proj-completed': { title: 'Case Studies', desc: 'Completed projects and post-mortems of past work.', url: '/projects/#case-studies' }
  };

  if (projectOverviews[node.id]) {
      const po = projectOverviews[node.id];
      document.getElementById("node-drawer-body").innerHTML = `
          <div class="drawer-content-body">
              <h3 style="color: var(--accent-blue); margin-bottom: 0.5rem; font-size: 1.5rem;">${po.title}</h3>
              <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${po.desc}</p>
              <a href="${po.url}" class="btn" style="display:inline-block; margin-top:1rem; text-decoration:none; color:#fff; background:var(--accent-blue); padding:0.5rem 1rem; border-radius:4px; font-weight:bold;">View ${po.title} ↗</a>
          </div>
      `;
      return;
  }

  const libraryOverviews = {
      'lib-books': { title: 'Books', desc: 'A collection of books I have read or am currently reading.', url: '/library/#books' },
      'lib-hardware': { title: 'Hardware', desc: 'Physical tools, tech, and equipment I use.', url: '/library/#hardware' },
      'lib-software': { title: 'Software', desc: 'Apps, programs, and digital utilities.', url: '/library/#software' },
      'lib-tools': { title: 'Tools', desc: 'Digital and physical tools for making things.', url: '/library/#tools' },
      'lib-games': { title: 'Games', desc: 'Video games, board games, and tabletop RPGs.', url: '/library/#games' },
      'lib-creators': { title: 'Creators', desc: 'People, channels, and content creators who inspire me.', url: '/library/#creators' }
  };

  if (libraryOverviews[node.id]) {
      const lo = libraryOverviews[node.id];
      document.getElementById("node-drawer-body").innerHTML = `
          <div class="drawer-content-body">
              <h3 style="color: var(--accent-orange); margin-bottom: 0.5rem; font-size: 1.5rem;">${lo.title}</h3>
              <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${lo.desc}</p>
              <a href="${lo.url}" class="btn" style="display:inline-block; margin-top:1rem; text-decoration:none; color:#fff; background:var(--accent-orange); padding:0.5rem 1rem; border-radius:4px; font-weight:bold;">View ${lo.title} ↗</a>
          </div>
      `;
      return;
  }

  const newHubOverviews = {
      'hub-core-values': { title: 'Core Values', desc: 'My philosophy, politics, and personal beliefs.', url: null, color: 'var(--accent-purple)' },
      'hub-passions': { title: 'Passions', desc: 'Interests, hobbies, and things that set my soul on fire.', url: null, color: 'var(--accent-green)' },
      'hub-life-experiences': { title: 'Life Experiences', desc: 'Growth, history, and things that grind my gears.', url: null, color: 'var(--accent-cyan)' },
      'hub-workshop': { title: 'The Workshop', desc: 'Projects, tools, tech, and experiments.', url: null, color: 'var(--accent-blue)' },
      'hub-connections': { title: 'Social Media', desc: 'Where to find me online across various platforms.', url: null, color: 'var(--accent-red)' },
      'hub-soapbox': { title: 'The Soapbox', desc: 'Candid opinions, hot takes, and the companies that have earned my frustration.', url: null, color: 'var(--accent-orange)' },
      'hub-rabbit-hole': { title: 'The Rabbit Hole', desc: 'Deep dives, obsessions, and the topics I can\'t stop thinking about.', url: null, color: 'var(--accent-cyan)' },
      'hub-blueprints': { title: 'The Blueprint Room', desc: 'Systems, workflows, and the way I think about building things.', url: null, color: 'var(--accent-blue)' },
      'hub-archive': { title: 'Career File', desc: 'Work history, skills, and the professional journey so far.', url: '/resume/', color: 'var(--accent-purple)' },
      'hub-forge': { title: 'The Forge', desc: 'Projects I have built, am building, or have shipped into the world.', url: '/projects/', color: 'var(--accent-orange)' }
  };

  if (newHubOverviews[node.id]) {
      const ho = newHubOverviews[node.id];
      document.getElementById("node-drawer-body").innerHTML = `
          <div class="drawer-content-body">
              <h3 style="color: ${ho.color}; margin-bottom: 0.5rem; font-size: 1.5rem;">${ho.title}</h3>
              <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${ho.desc}</p>
              ${ho.url ? `<a href="${ho.url}" class="btn" style="display:inline-block; margin-top:1rem; text-decoration:none; color:#fff; background:${ho.color}; padding:0.5rem 1rem; border-radius:4px; font-weight:bold;">View ${ho.title} ↗</a>` : ''}
          </div>
      `;
      return;
  }

  // Fetch the page content and extract the meaningful body
  try {
    const res = await fetch(node.url);
    if (!res.ok) throw new Error("fetch failed");
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extract body content from common content wrappers
    const bodyEl = doc.querySelector(".article-body, .topic-body, .theme-body, .collection-body, .library-body, main article, .content-body");
    const extracted = bodyEl ? bodyEl.innerHTML : "";

    // Extract related/article cards
    const relatedEl = doc.querySelectorAll(".article-card, .project-card");
    let relatedHtml = "";
    if (relatedEl.length > 0) {
      relatedHtml = `<div class="drawer-related-label">Connected Content</div><div class="drawer-related-grid">`;
      const maxItems = 5;
      const cardsToRender = Array.from(relatedEl).slice(0, maxItems);
      cardsToRender.forEach(card => {
        relatedHtml += card.outerHTML;
      });
      relatedHtml += "</div>";
    }

    if (extracted) {
      document.getElementById("node-drawer-body").innerHTML = `<div class="drawer-content-body">${extracted}</div>`;
      // Re-initialize paywall if the loaded article has a paywall
      initMemberPaywallAuth(document.getElementById("node-drawer-body"));
    } else {
      document.getElementById("node-drawer-body").innerHTML = `<p class="drawer-empty">Content available on full page.</p>`;
    }

    if (relatedHtml) {
      document.getElementById("node-drawer-related").innerHTML = relatedHtml;
    }

  } catch (err) {
    document.getElementById("node-drawer-body").innerHTML = `<p class="drawer-empty">Unable to load preview. <a href="${node.url}">Visit page directly</a>.</p>`;
  }
}

/* ============================================================
   Image Lightbox
   ============================================================ */
function initImageLightbox() {
  const images = document.querySelectorAll('.article-image');
  if (images.length === 0) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'article-lightbox';
  const imgElement = document.createElement('img');
  lightbox.appendChild(imgElement);
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '&times;';
  lightbox.appendChild(closeBtn);
  
  document.body.appendChild(lightbox);

  const closeLightbox = () => {
    lightbox.classList.remove('active');
  };

  lightbox.addEventListener('click', (e) => {
    if (e.target !== imgElement) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  images.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      imgElement.src = img.src;
      lightbox.classList.add('active');
    });
  });
}
