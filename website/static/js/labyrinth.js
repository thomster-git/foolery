/**
 * Yu-Gi-Oh! Mind Labyrinth (PoC)
 * Isometric 2.5D Canvas Renderer for the Knowledge Graph
 */

document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("labyrinth-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const roomLabel = document.getElementById("current-room-label");

    // Camera / Viewport state
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let offsetX = width / 2;
    let offsetY = height / 2;
    let scale = 1.0;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let cameraTarget = { x: width / 2, y: height / 2, scale: 1.0 };
    let currentActiveRoom = null;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Isometric Projection Helpers
    const TILE_W = 60;
    const TILE_H = 30;

    function isoToScreen(isoX, isoY, isoZ) {
        return {
            x: ((isoX - isoZ) * (TILE_W / 2)) * scale + offsetX,
            y: ((isoX + isoZ) * (TILE_H / 2) - (isoY * TILE_H)) * scale + offsetY
        };
    }

    // Load Data
    let graphData = null;
    try {
        const res = await fetch("/graph.json");
        graphData = await res.json();
    } catch (err) {
        console.error("Failed to load graph for labyrinth", err);
        return;
    }

    // Process Graph Data into Rooms
    // We group by "theme". For simplicity in PoC, we will extract all themes and build a "room" for each.
    const themes = graphData.nodes.filter(n => n.type === 'theme');
    const topics = graphData.nodes.filter(n => n.type === 'topic');
    const articles = graphData.nodes.filter(n => n.type === 'article');
    
    // Layout parameters
    const rooms = {};
    let roomCounter = 0;

    themes.forEach((theme) => {
        // Space rooms apart on a macro grid
        const macroX = (roomCounter % 3) * 15;
        const macroZ = Math.floor(roomCounter / 3) * 15;
        const macroY = (roomCounter % 2) * 5; // Slight elevation changes for Escher effect

        rooms[theme.id] = {
            node: theme,
            baseX: macroX,
            baseZ: macroZ,
            baseY: macroY,
            children: []
        };
        roomCounter++;
    });

    // Assign topics/articles to rooms based on edges
    graphData.edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;
        // If a topic is linked to a theme, put it in that room
        if (rooms[source] && graphData.nodes.find(n => n.id === target)) {
            rooms[source].children.push(graphData.nodes.find(n => n.id === target));
        } else if (rooms[target] && graphData.nodes.find(n => n.id === source)) {
            rooms[target].children.push(graphData.nodes.find(n => n.id === source));
        }
    });

    // Build the visual nodes array
    const renderNodes = [];
    Object.values(rooms).forEach(room => {
        // Add the theme node as the central pillar
        renderNodes.push({
            ...room.node,
            isoX: room.baseX,
            isoZ: room.baseZ,
            isoY: room.baseY + 1,
            isTheme: true,
            roomId: room.node.id,
            roomTitle: room.node.label,
            opacity: 1.0,
            targetOpacity: 1.0
        });

        // Arrange children around the center in a small local grid
        room.children.forEach((child, idx) => {
            const angle = (idx / room.children.length) * Math.PI * 2;
            const dist = 2 + (idx % 2);
            renderNodes.push({
                ...child,
                isoX: room.baseX + Math.cos(angle) * dist,
                isoZ: room.baseZ + Math.sin(angle) * dist,
                isoY: room.baseY,
                isTheme: false,
                roomId: room.node.id,
                roomTitle: room.node.label,
                opacity: 0.0,
                targetOpacity: 0.0
            });
        });
    });

    // Interaction handling
    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            offsetX += dx;
            offsetY += dy;
            dragStart = { x: e.clientX, y: e.clientY };
            // Cancel camera targeting if user drags
            cameraTarget.x = offsetX;
            cameraTarget.y = offsetY;
        } else {
            // Hover detection
            let hovered = null;
            for (let i = renderNodes.length - 1; i >= 0; i--) {
                const node = renderNodes[i];
                const screenPos = isoToScreen(node.isoX, node.isoY, node.isoZ);
                const dx = e.clientX - screenPos.x;
                const dy = e.clientY - screenPos.y;
                if (Math.sqrt(dx * dx + dy * dy) < 20) {
                    hovered = node;
                    break;
                }
            }
            if (hovered) {
                canvas.style.cursor = "pointer";
                roomLabel.innerText = hovered.label + (hovered.isTheme ? " (Portal)" : "");
            } else {
                canvas.style.cursor = "default";
                roomLabel.innerText = "Exploring Labyrinth";
            }
        }
    });

    canvas.addEventListener("mouseup", () => isDragging = false);
    canvas.addEventListener("mouseleave", () => isDragging = false);

    canvas.addEventListener("wheel", (e) => {
        const zoomSensitivity = 0.002;
        const zoomFactor = 1 - e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.2, scale * zoomFactor), 4.0);
        
        // Zoom to mouse
        offsetX = e.clientX - (e.clientX - offsetX) * (newScale / scale);
        offsetY = e.clientY - (e.clientY - offsetY) * (newScale / scale);
        scale = newScale;
        cameraTarget.scale = scale;
        cameraTarget.x = offsetX;
        cameraTarget.y = offsetY;
    }, { passive: true });

    canvas.addEventListener("click", (e) => {
        // Find clicked node
        for (let i = renderNodes.length - 1; i >= 0; i--) {
            const node = renderNodes[i];
            if (node.opacity < 0.2) continue; // Don't click hidden nodes

            const screenPos = isoToScreen(node.isoX, node.isoY, node.isoZ);
            const dx = e.clientX - screenPos.x;
            const dy = e.clientY - screenPos.y;
            // Scale hit radius
            if (Math.sqrt(dx * dx + dy * dy) < 20 * scale) {
                if (node.isTheme) {
                    if (currentActiveRoom === node.id) {
                        // Exit room if already inside
                        currentActiveRoom = null;
                        cameraTarget.scale = 1.0;
                    } else {
                        // Enter room
                        currentActiveRoom = node.id;
                        cameraTarget.scale = 2.0;
                    }

                    // Update opacities
                    renderNodes.forEach(n => {
                        if (currentActiveRoom === null) {
                            n.targetOpacity = n.isTheme ? 1.0 : 0.0;
                        } else {
                            if (n.isTheme && n.id !== currentActiveRoom) {
                                n.targetOpacity = 0.15; // Dim other themes
                            } else if (n.roomId === currentActiveRoom) {
                                n.targetOpacity = 1.0; // Show active room and its branches
                            } else {
                                n.targetOpacity = 0.0; // Hide other branches
                            }
                        }
                    });

                    // Focus camera on this room (we calculate this dynamically in render loop since scale changes)
                    const tempScale = scale;
                    scale = cameraTarget.scale;
                    const targetScreen = isoToScreen(node.isoX, node.isoY, node.isoZ);
                    scale = tempScale;

                    cameraTarget.x = offsetX + (width / 2 - targetScreen.x);
                    cameraTarget.y = offsetY + (height / 2 - targetScreen.y);
                } else {
                    // Navigate to article/topic
                    if (node.url) window.location.href = node.url;
                }
                break;
            }
        }
    });

    // Render Loop
    function drawCube(ctx, x, y, size, colorTop, colorLeft, colorRight, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;
        
        // Top face
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, -size/2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-size, -size/2);
        ctx.closePath();
        ctx.fillStyle = colorTop;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.stroke();

        // Left face
        ctx.beginPath();
        ctx.moveTo(-size, -size/2);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, size/2);
        ctx.closePath();
        ctx.fillStyle = colorLeft;
        ctx.fill();
        ctx.stroke();

        // Right face
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, -size/2);
        ctx.lineTo(size, size/2);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fillStyle = colorRight;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    function render() {
        // Camera easing
        offsetX += (cameraTarget.x - offsetX) * 0.1;
        offsetY += (cameraTarget.y - offsetY) * 0.1;
        if (!isDragging && Math.abs(cameraTarget.scale - scale) > 0.001) {
            // Smooth zoom to center of screen when clicking rooms
            const newScale = scale + (cameraTarget.scale - scale) * 0.1;
            offsetX = (width / 2) - ((width / 2) - offsetX) * (newScale / scale);
            offsetY = (height / 2) - ((height / 2) - offsetY) * (newScale / scale);
            scale = newScale;
        }

        ctx.clearRect(0, 0, width, height);

        // Helper to get visual position (lerps from parent to child based on opacity)
        const getVisualPos = (node) => {
            const screenPos = isoToScreen(node.isoX, node.isoY, node.isoZ);
            if (node.isTheme) return screenPos;
            
            const parent = renderNodes.find(n => n.id === node.roomId);
            if (!parent) return screenPos;
            
            const parentScreen = isoToScreen(parent.isoX, parent.isoY, parent.isoZ);
            const t = node.opacity; // ranges 0.0 to 1.0
            
            return {
                x: parentScreen.x + (screenPos.x - parentScreen.x) * t,
                y: parentScreen.y + (screenPos.y - parentScreen.y) * t
            };
        };

        // Draw connections (impossible stairs metaphor)
        graphData.edges.forEach(edge => {
            const n1 = renderNodes.find(n => n.id === edge.source);
            const n2 = renderNodes.find(n => n.id === edge.target);
            if (n1 && n2) {
                const p1 = getVisualPos(n1);
                const p2 = getVisualPos(n2);
                
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(56, 189, 248, 0.15)`;
                ctx.lineWidth = 1.0 * scale;
                ctx.stroke();
            }
        });

        // Depth sort nodes based on isometric Y + Z
        renderNodes.sort((a, b) => {
            const depthA = a.isoX + a.isoZ - a.isoY;
            const depthB = b.isoX + b.isoZ - b.isoY;
            return depthA - depthB;
        });

        // Draw Nodes
        renderNodes.forEach(node => {
            // Animate opacity
            node.opacity += (node.targetOpacity - node.opacity) * 0.1;
            
            if (node.opacity < 0.01) return; // Don't draw invisible nodes

            const screenPos = isoToScreen(node.isoX, node.isoY, node.isoZ);
            
            if (node.isTheme) {
                // Draw a tall pillar for a theme room hub
                drawCube(ctx, screenPos.x, screenPos.y, 20, "#38bdf8", "#0284c7", "#0369a1", node.opacity);
                
                // Label
                ctx.globalAlpha = node.opacity;
                ctx.fillStyle = "#fff";
                ctx.font = "bold " + (14 * scale) + "px monospace";
                ctx.textAlign = "center";
                ctx.fillText(node.label, screenPos.x, screenPos.y - (30 * scale));
                ctx.globalAlpha = 1.0;
            } else {
                // Draw a smaller flat tile for a topic/article
                let cTop = "#64748b";
                let cLeft = "#475569";
                let cRight = "#334155";
                
                if (node.type === 'article') {
                    cTop = "#8b5cf6"; cLeft = "#7c3aed"; cRight = "#6d28d9";
                }

                drawCube(ctx, screenPos.x, screenPos.y, 10, cTop, cLeft, cRight, node.opacity);
                
                // Show label when inside a room
                if (node.opacity > 0.5) {
                    ctx.globalAlpha = (node.opacity - 0.5) * 2.0;
                    ctx.fillStyle = "#cbd5e1";
                    ctx.font = (10 * scale) + "px monospace";
                    ctx.textAlign = "center";
                    ctx.fillText(node.label, screenPos.x, screenPos.y - (15 * scale));
                    ctx.globalAlpha = 1.0;
                }
            }
        });

        requestAnimationFrame(render);
    }

    // Start
    roomLabel.innerText = "Labyrinth Initialized";
    render();
});
