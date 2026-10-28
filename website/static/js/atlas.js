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
  initLemonSqueezyOverlay();
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
  let filteredNodes = [];
  let filteredEdges = [];

  if (focusId) {
    // Focused on a specific content item (e.g. article, topic, theme, project)
    const connectedNodeIds = new Set([focusId]);
    (data.edges || []).forEach(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      if (from === focusId) connectedNodeIds.add(to);
      if (to === focusId) connectedNodeIds.add(from);
    });

    // Exclude raw tags from article/project graphs when substantive content connections exist
    const hasSubstantiveConnections = (data.edges || []).some(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return (from === focusId || to === focusId) && e.relation !== 'tags';
    });

    filteredNodes = data.nodes.filter(n => {
      if (!connectedNodeIds.has(n.id)) return false;
      if (hasSubstantiveConnections && n.type === 'tag') return false;
      return true;
    });

    const activeNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = (data.edges || []).filter(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return activeNodeIds.has(from) && activeNodeIds.has(to) && (!hasSubstantiveConnections || e.relation !== 'tags');
    });

  } else if (focusTag) {
    // Focused on a specific tag page (#tag)
    const tagNodeId = `tag-${focusTag}`;
    const connectedNodeIds = new Set([tagNodeId]);
    (data.edges || []).forEach(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      if (from === tagNodeId) connectedNodeIds.add(to);
      if (to === tagNodeId) connectedNodeIds.add(from);
    });

    filteredNodes = data.nodes.filter(n => connectedNodeIds.has(n.id));
    const activeNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = (data.edges || []).filter(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return activeNodeIds.has(from) && activeNodeIds.has(to);
    });

  } else if (focusType === 'global' || focusType === 'full') {
    // Homepage Interactive Knowledge Graph & Full Digital Garden Map:
    // Focus strictly on published content (articles, topics, themes, projects, software/library)
    // Filter out raw tags and category stubs so the visualization is clean, beautiful, and purposeful
    const contentNodes = data.nodes.filter(n => n.type !== 'tag' && n.type !== 'library-category');
    const contentIds = new Set(contentNodes.map(n => n.id));

    // Central Digital Garden Core Anchor
    const rootHub = {
      id: 'hub-global',
      label: 'Thoms Foolery',
      type: 'hub',
      url: '/graph/',
      summary: 'The Digital Garden — Explore connected essays, systems, and projects'
    };

    filteredNodes = [rootHub, ...contentNodes];

    // Connect root hub to main pillars (topics and themes)
    const pillarEdges = [];
    contentNodes.forEach(n => {
      if (n.type === 'topic' || n.type === 'theme') {
        pillarEdges.push({
          source: 'hub-global',
          target: n.id,
          relation: 'pillar'
        });
      }
    });

    // Real published content edges
    const realEdges = (data.edges || []).filter(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return contentIds.has(from) && contentIds.has(to) && e.relation !== 'tags';
    });

    filteredEdges = [...pillarEdges, ...realEdges];
    focusId = 'hub-global';

  } else if (focusType) {
    // Category index pages (e.g. /articles/, /topics/, /projects/, /library/)
    let baseNodes;
    let hubTitle = "Hub";
    if (focusType === "library") {
      baseNodes = data.nodes.filter(n => libraryTypes.includes(n.type));
      hubTitle = "Library";
    } else {
      baseNodes = data.nodes.filter(n => n.type === focusType);
      hubTitle = focusType.charAt(0).toUpperCase() + focusType.slice(1) + (focusType.endsWith('s') ? '' : 's');
    }
    
    const hubNodeId = `hub-${focusType}`;
    const hubNode = {
      id: hubNodeId,
      label: hubTitle,
      type: "hub",
      url: `/${focusType === 'library' ? 'library' : focusType + 's'}/`,
      summary: `Central hub for all ${hubTitle}`
    };
    
    filteredNodes = [hubNode, ...baseNodes];
    filteredEdges = baseNodes.map(n => ({
      source: hubNodeId,
      target: n.id,
      relation: 'hub-connection'
    }));
    focusId = hubNodeId;
  } else {
    // Default fallback: all non-tag published content
    filteredNodes = data.nodes.filter(n => n.type !== 'tag' && n.type !== 'library-category');
    const cIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = (data.edges || []).filter(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return cIds.has(from) && cIds.has(to) && e.relation !== 'tags';
    });
  }

  let nodes = [];
  let nodeMap = new Map();
  let links = [];

  // Safe URL resolver to prevent 404s
  const resolveUrl = (n) => {
    if (n.url) return n.url;
    if (n.id === 'hub-global') return '/graph/';
    if (libraryTypes.includes(n.type)) {
      const libPlural = ["hardware", "software", "music", "documentation"].includes(n.type) ? n.type : `${n.type}s`;
      return `/library/${libPlural}/${n.id}.html`;
    }
    return `/${n.type}s/${n.id}.html`;
  };

  // Find all real published content children connected to a category
  function getCategoryChildren(catId) {
    const connectedEdges = (data.edges || []).filter(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return (from === catId || to === catId) && e.relation !== 'tags';
    });
    const childIds = new Set(connectedEdges.map(e => {
      const from = e.source || e.from;
      const to = e.target || e.to;
      return from === catId ? to : from;
    }));
    return (data.nodes || []).filter(n => childIds.has(n.id) && n.id !== catId && n.type !== 'tag' && n.type !== 'library-category');
  }

  function toggleCategoryExpansion(catNode, children) {
    const cx = width / 2;
    const cy = height / 2;

    if (!catNode.expanded) {
      // EXPAND: sprout connected articles/nodes outward from category
      catNode.expanded = true;
      const count = children.length;
      const baseAngle = Math.atan2(catNode.y - cy, catNode.x - cx);
      const spread = Math.min(Math.PI * 0.85, Math.PI * 0.22 * Math.max(2, count));
      const startAngle = count > 1 ? baseAngle - spread / 2 : baseAngle;
      const angleStep = count > 1 ? spread / (count - 1) : 0;

      const spawnedIds = [];

      children.forEach((child, i) => {
        spawnedIds.push(child.id);
        let childNode = nodeMap.get(child.id);

        if (!childNode) {
          const childAngle = count === 1 ? baseAngle : startAngle + i * angleStep;
          const dist = 115 + (i % 2) * 22; // Staggered radial distance for clean label positioning
          childNode = {
            ...child,
            url: resolveUrl(child),
            x: catNode.x + Math.cos(childAngle) * dist,
            y: catNode.y + Math.sin(childAngle) * dist,
            vx: Math.cos(childAngle) * 0.12,
            vy: Math.sin(childAngle) * 0.12,
            radius: child.type === 'article' ? 13 : 11,
            isFocused: false,
            expanded: false
          };
          nodes.push(childNode);
          nodeMap.set(child.id, childNode);
        }

        // Connect link between category and child
        const linkExists = links.some(l =>
          (l.source === catNode && l.target === childNode) ||
          (l.target === catNode && l.source === childNode)
        );
        if (!linkExists && childNode) {
          links.push({
            source: catNode,
            target: childNode,
            relation: 'expansion'
          });
        }
      });

      catNode.spawnedNodeIds = spawnedIds;

    } else {
      // COLLAPSE: retract children back into category
      catNode.expanded = false;
      const toRemove = catNode.spawnedNodeIds || [];

      toRemove.forEach(id => {
        // Only remove if no OTHER expanded category is still claiming this node
        const stillClaimed = nodes.some(n => n !== catNode && n.expanded && (n.spawnedNodeIds || []).includes(id));
        if (!stillClaimed) {
          nodes = nodes.filter(n => n.id !== id);
          links = links.filter(l => l.source.id !== id && l.target.id !== id);
          nodeMap.delete(id);
        } else {
          // Remove only the link from this category
          links = links.filter(l => !(
            (l.source === catNode && l.target.id === id) ||
            (l.target === catNode && l.source.id === id)
          ));
        }
      });

      catNode.spawnedNodeIds = [];
    }
  }

  function buildInitialGraph() {
    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);
    const isGlobalOrFull = focusType === 'global' || focusType === 'full';

    // Layout hierarchy rings for clean, non-overlapping spacing:
    // Center: focusId node (e.g. hub-global)
    // Ring 1: Category bubbles (Topics & Themes)
    // Ring 2: Content Nodes (Articles, Projects, Software) - hidden by default if isGlobalOrFull
    const ring1 = [];
    const ring2 = [];
    let centerNode = null;

    filteredNodes.forEach(n => {
      if (n.id === focusId) {
        centerNode = n;
      } else if (n.type === 'topic' || n.type === 'theme') {
        ring1.push(n);
      } else {
        ring2.push(n);
      }
    });

    const r1 = Math.max(130, minDim * 0.32);
    const r2 = Math.max(200, minDim * 0.44);

    nodes = [];

    if (centerNode) {
      nodes.push({
        ...centerNode,
        url: resolveUrl(centerNode),
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        radius: centerNode.id === 'hub-global' ? 22 : 18,
        isFocused: true,
        expanded: false
      });
    }

    ring1.forEach((n, i) => {
      const angle = (i / Math.max(1, ring1.length)) * Math.PI * 2 - Math.PI / 2;
      const children = getCategoryChildren(n.id);
      const articleCount = children.filter(c => c.type === 'article').length;
      nodes.push({
        ...n,
        url: resolveUrl(n),
        x: cx + Math.cos(angle) * r1,
        y: cy + Math.sin(angle) * r1,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        radius: n.type === 'topic' ? 14 : 13,
        isFocused: false,
        expanded: false,
        displayCount: articleCount || children.length,
        spawnedNodeIds: []
      });
    });

    // In global/full graph, articles are hidden within the category bubbles by default.
    // In specific single-category views, ring2 nodes are shown.
    if (!isGlobalOrFull) {
      ring2.forEach((n, i) => {
        const angle = (i / Math.max(1, ring2.length)) * Math.PI * 2 + Math.PI / 4;
        nodes.push({
          ...n,
          url: resolveUrl(n),
          x: cx + Math.cos(angle) * r2,
          y: cy + Math.sin(angle) * r2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          radius: n.type === 'article' ? 14 : 11,
          isFocused: false,
          expanded: false
        });
      });
    }

    nodeMap = new Map(nodes.map(n => [n.id, n]));
    links = filteredEdges.map(e => ({
      source: nodeMap.get(e.source || e.from),
      target: nodeMap.get(e.target || e.to)
    })).filter(l => l.source && l.target);
  }

  buildInitialGraph();

  function resetGraphLayout() {
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    hoveredNode = null;
    draggedNode = null;
    if (tooltip) tooltip.style.display = "none";
    buildInitialGraph();
  }

  const resetBtn = document.getElementById("graph-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetGraphLayout();
    });
  }

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
      const isCategory = hoveredNode.type === 'topic' || hoveredNode.type === 'theme';
      const children = isCategory ? getCategoryChildren(hoveredNode.id) : [];
      const articleCount = children.filter(c => c.type === 'article').length;

      let actionText = '';
      if (hoveredNode.type === 'article') {
        actionText = 'Click to read article →';
      } else if (isCategory && children.length > 0) {
        actionText = hoveredNode.expanded
          ? 'Click to collapse articles ▲'
          : `Click to expand ${articleCount || children.length} article${(articleCount || children.length) > 1 ? 's' : ''} ▼`;
      } else if (isDrawerType) {
        actionText = 'Click to preview in panel ↗';
      } else {
        actionText = 'Click to view page →';
      }

      tooltip.innerHTML = `
        <div style="font-weight:700; color:#38bdf8; font-size:13px;">${escapeHtml(hoveredNode.label || hoveredNode.id)}</div>
        <div style="font-size:10px; text-transform:uppercase; color:#818cf8; margin-top:2px; font-weight:600;">${escapeHtml(hoveredNode.type)}</div>
        ${hoveredNode.summary ? `<div style="font-size:11px; color:#94a3b8; margin-top:4px; line-height:1.4;">${escapeHtml(hoveredNode.summary.slice(0, 110))}...</div>` : ''}
        <div style="font-size:10px; color:#34d399; margin-top:6px; font-weight:600;">${actionText}</div>
        ${isCategory && children.length > 0 ? '<div style="font-size:9px; color:#64748b; margin-top:2px;">Double-click to view category info</div>' : ''}
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
      if (hoveredNode.id === 'hub-global') {
        if (focusType === 'global') {
          window.location.href = '/graph/';
        } else {
          openNodeDrawer(hoveredNode);
        }
      } else if (hoveredNode.type === 'topic' || hoveredNode.type === 'theme') {
        const children = getCategoryChildren(hoveredNode.id);
        if (children.length > 0) {
          toggleCategoryExpansion(hoveredNode, children);
        } else {
          openNodeDrawer(hoveredNode);
        }
      } else if (hoveredNode.type === 'article' && hoveredNode.url) {
        window.location.href = hoveredNode.url;
      } else if (drawerTypes.has(hoveredNode.type)) {
        openNodeDrawer(hoveredNode);
      } else if (hoveredNode.url) {
        window.location.href = hoveredNode.url;
      } else {
        openNodeDrawer(hoveredNode);
      }
    }
  });

  canvas.addEventListener("dblclick", () => {
    if (hoveredNode) {
      if (hoveredNode.type === 'article' && hoveredNode.url) {
        window.location.href = hoveredNode.url;
      } else {
        openNodeDrawer(hoveredNode);
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

    // Soft node-node repulsion to prevent overlap and maintain label legibility
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const minDist = a.radius + b.radius + 60;
        if (dist < minDist) {
          const force = ((minDist - dist) / minDist) * 0.2;
          const nx = (dx / dist) * force;
          const ny = (dy / dist) * force;
          if (a !== draggedNode && !a.isFocused) {
            a.x -= nx;
            a.y -= ny;
          }
          if (b !== draggedNode && !b.isFocused) {
            b.x += nx;
            b.y += ny;
          }
        }
      }
    }

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

        const pad = n.radius + 24;
        if (n.x < pad) { n.x = pad; n.vx = Math.abs(n.vx); }
        else if (n.x > width - pad) { n.x = width - pad; n.vx = -Math.abs(n.vx); }
        if (n.y < pad) { n.y = pad; n.vy = Math.abs(n.vy); }
        else if (n.y > height - pad) { n.y = height - pad; n.vy = -Math.abs(n.vy); }
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

      // Type-specific color palette for visual hierarchy and clarity
      const typeColors = {
        hub: "#38bdf8",       // Bright Sky Blue (central garden hub)
        article: "#60a5fa",   // Slate Blue (in-depth essays)
        topic: "#34d399",     // Mint Emerald (pillar curiosity topics)
        theme: "#f59e0b",     // Warm Amber (philosophical themes)
        project: "#a855f7",   // Purple (tools & systems)
        software: "#ec4899",  // Pink (library tools)
        library: "#ec4899"
      };
      const nodeColor = typeColors[n.type] || (n.id === 'hub-global' ? "#38bdf8" : "#818cf8");

      if (isActive || isSearchHighlight) {
        ctx.fillStyle = textColorPrimary;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 22;
      } else if (isNeighbor) {
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 14;
      } else if (n.isFocused) {
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = nodeColor;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Category expansion indicator ring
      if (n.expanded) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (n.displayCount > 0) {
        // Subtle dotted indicator ring for categories with hidden articles
        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label text: truncate long titles when not active to prevent canvas clutter
      let labelText = n.label || n.title || n.id;
      if (!isActive && labelText.length > 28) {
        labelText = labelText.slice(0, 26) + "…";
      }
      if (!n.expanded && n.displayCount > 0) {
        labelText += ` (${n.displayCount})`;
      }

      // Node label with font expansion & contrast boost
      if (isActive) {
        ctx.fillStyle = textColorPrimary;
        ctx.font = "bold 16px Outfit, system-ui, sans-serif";
        if (isDark) {
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
      } else if (isNeighbor) {
        ctx.fillStyle = nodeColor;
        ctx.font = "600 13px Outfit, system-ui, sans-serif";
      } else if (n.isFocused || n.type === 'hub') {
        ctx.fillStyle = textColorPrimary;
        ctx.font = "bold 14px Outfit, system-ui, sans-serif";
      } else {
        ctx.fillStyle = textColorSecondary;
        ctx.font = "12px Outfit, system-ui, sans-serif";
      }

      ctx.fillText(labelText, n.x + r + 8, n.y + 4);
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
    if (!token) return false;
    const cleaned = token.trim();
    if (!cleaned.startsWith("Atlas-")) return false;
    try {
      const b64 = cleaned.replace("Atlas-", "");
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
          authError.textContent = "Invalid or expired supporter token";
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

  const fullLink = document.getElementById("node-drawer-full-link");
  if (fullLink) {
    if (node.url) {
      fullLink.href = node.url;
      fullLink.style.display = "inline-flex";
    } else {
      fullLink.removeAttribute("href");
      fullLink.style.display = "none";
    }
  }

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
      'hub-global': { title: 'Thoms Foolery', desc: 'The Digital Garden of Jonathan Thoms. An evolving network of interconnected engineering essays, digital field guides, and interactive tools.', url: '/graph/', color: 'var(--accent-cyan)' },
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

  if (!node.url) {
    document.getElementById("node-drawer-body").innerHTML = `<div class="drawer-content-body"><p style="color: var(--text-muted); line-height: 1.6;">${node.summary ? escapeHtml(node.summary) : "Overview available in the knowledge graph."}</p></div>`;
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
    document.getElementById("node-drawer-body").innerHTML = `<p class="drawer-empty">Unable to load preview.${node.url ? ` <a href="${node.url}">Visit page directly</a>.` : ''}</p>`;
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

/* ============================================================
   8. Lemon Squeezy Checkout Overlay Support
   ============================================================ */

function initLemonSqueezyOverlay() {
  const tryInit = () => {
    if (typeof window.createLemonSqueezy === "function") {
      window.createLemonSqueezy();
    }
  };

  tryInit();

  if (typeof window.createLemonSqueezy !== "function") {
    window.addEventListener("load", tryInit, { once: true });
    // Fallback polling for slow deferred script loading
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window.createLemonSqueezy === "function") {
        window.createLemonSqueezy();
        clearInterval(interval);
      } else if (attempts > 15) {
        clearInterval(interval);
      }
    }, 200);
  }

  // Setup Lemon Squeezy event hooks if available
  if (window.LemonSqueezy && typeof window.LemonSqueezy.Setup === "function") {
    try {
      window.LemonSqueezy.Setup({
        eventHandler: (event) => {
          if (event && event.event === "Checkout.Success") {
            console.log("Lemon Squeezy checkout succeeded:", event.data);
          }
        }
      });
    } catch (e) {
      console.warn("LemonSqueezy Setup warning:", e);
    }
  }
}

