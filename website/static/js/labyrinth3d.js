const container = document.getElementById('webgl-container');
const roomSelector = document.getElementById('room-selector');
function setRoomLabel(text, id) {
    if (id && roomSelector.querySelector(`option[value="${id}"]`)) {
        roomSelector.value = id;
    } else {
        let travelOpt = document.getElementById('travel-opt');
        if (!travelOpt) {
            travelOpt = document.createElement('option');
            travelOpt.id = 'travel-opt';
            travelOpt.value = 'travel';
            travelOpt.hidden = true;
            roomSelector.appendChild(travelOpt);
        }
        travelOpt.innerText = text;
        roomSelector.value = 'travel';
    }
}

// Sidebar UI Elements
const sidebar = document.getElementById('info-sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDesc = document.getElementById('sidebar-desc');
const sidebarType = document.getElementById('sidebar-type');
const sidebarLink = document.getElementById('sidebar-link');

closeSidebar.addEventListener('click', () => {
    sidebar.style.right = '-400px';
});

const scene = new THREE.Scene();
scene.background = new THREE.Color('#090d16');
scene.fog = new THREE.FogExp2('#090d16', 0.0015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 30, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.7;
bloomPass.strength = 0.6;
bloomPass.radius = 0.4;

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableKeys = false;
controls.listenToKeyEvents = function(){}; // Disable default arrow panning
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 1500;
controls.minDistance = 25;
controls.maxPolarAngle = Math.PI / 2 + 0.05;
controls.target.set(0, 30, 0);

const ambientLight = new THREE.AmbientLight(0x1e1b4b, 0.25);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(200, 500, 300);
scene.add(dirLight);

const particleCount = 1500;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
const particlePhase = new Float32Array(particleCount);
for(let i=0; i<particleCount*3; i++) {
    particlePos[i] = (Math.random() - 0.5) * 1000;
}
for(let i=0; i<particleCount; i++) {
    particlePhase[i] = Math.random() * Math.PI * 2;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
particleGeo.setAttribute('phase', new THREE.BufferAttribute(particlePhase, 1));

const particleMat = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        color: { value: new THREE.Color(0x38bdf8) }
    },
    vertexShader: `
        uniform float time;
        attribute float phase;
        varying float vAlpha;
        void main() {
            vec3 pos = position;
            pos.y -= mod(time * 10.0 + phase * 100.0, 1000.0) - 500.0;
            pos.x += sin(time * 0.2 + phase * 10.0) * 50.0;
            pos.z += cos(time * 0.3 + phase * 15.0) * 50.0;
            
            // Wrap Y
            if (pos.y < -500.0) pos.y += 1000.0;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (20.0 / -mvPosition.z) * (1.5 + sin(phase));
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = 0.2 + sin(time * 1.5 + phase) * 0.3; // Twinkle
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
            // Soft circular particle
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float strength = (0.5 - dist) * 2.0;
            gl_FragColor = vec4(color, vAlpha * strength);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null;
const meshes = [];

let graphData = null;
let nodeMap = new Map(); // module-level so keydown handler can access it

// Hub Colors
const hubColors = {
    'childhood': 0x38bdf8,
    'connection': 0xef4444,
    'craftsmanship': 0xc084fc,
    'creativity': 0xf59e0b,
    'curiosity': 0x10b981,
    'growth': 0x8b5cf6,
    'identity': 0xf97316,
    'independence': 0xeab308,
    'learning': 0xd946ef,
    'mental-health': 0xef4444,
    'nostalgia': 0x06b6d4,
    'philosophy': 0x64748b,
    'pragmatism': 0x8b5cf6,
    'resilience': 0x10b981,
    'sustainability': 0x10b981,
    'systems-thinking': 0x06b6d4,
    'worldview': 0xf97316,
    'hub-uncharted': 0x334155
};

// Materials
const matNodeArticle = new THREE.MeshPhysicalMaterial({ color: 0x818cf8, transmission: 0.8, opacity: 1, roughness: 0.2, emissive: 0x818cf8, emissiveIntensity: 0.3, transparent: true });
const matNodeTopic = new THREE.MeshPhysicalMaterial({ color: 0x34d399, transmission: 0.8, opacity: 1, roughness: 0.2, emissive: 0x34d399, emissiveIntensity: 0.3, transparent: true });
const matNodeProject = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, transmission: 0.8, opacity: 1, roughness: 0.2, emissive: 0xf59e0b, emissiveIntensity: 0.3, transparent: true });
const matNodeLibrary = new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, transmission: 0.8, opacity: 1, roughness: 0.2, emissive: 0x8b5cf6, emissiveIntensity: 0.3, transparent: true });
const matNodeWebsite = new THREE.MeshPhysicalMaterial({ color: 0x10b981, transmission: 0.8, opacity: 1, roughness: 0.2, emissive: 0x10b981, emissiveIntensity: 0.3, transparent: true });
const matNodeHover = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, opacity: 1, roughness: 0.1, emissive: 0xffffff, emissiveIntensity: 0.8, transparent: true });

const matThemeHover = new THREE.MeshPhysicalMaterial({ color: 0xffffff, clearcoat: 0.5, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.5 });
const matUnchartedHover = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.3, transparent: true, opacity: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.4 });

const matBridge = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, transparent: true, opacity: 0.6, emissive: 0x0ea5e9, emissiveIntensity: 0.15 });
const matBridgeHover = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.5 });

// Geometries
const baseBoxGeo = new THREE.BoxGeometry(1, 1, 1);
const geoTheme = new THREE.CylinderGeometry(80, 80, 5, 32); // Sleek circular platform
const geoUncharted = new THREE.RingGeometry(65, 85, 32);
const matUncharted = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.3, transparent: true, opacity: 0.6 });
const geoNode = new THREE.BoxGeometry(20, 30, 4);
const geoPedestal = new THREE.BoxGeometry(26, 4, 10); // Staircase/pedestal for doors
const geoPillar = new THREE.BoxGeometry(20, 60, 20); // Center pillar for multi-floor hubs


function init3D(data) {
    graphData = data;
    
    const extraNodes = [
        { id: 'social-twitter', label: 'X / Twitter', type: 'website', url: 'https://x.com/ThomsFoolery', summary: 'Twitter profile' },
        { id: 'social-twitch', label: 'Twitch', type: 'website', url: 'https://www.twitch.tv/thomsfooiery', summary: 'Twitch channel' },
        { id: 'social-youtube', label: 'YouTube', type: 'website', url: 'https://www.youtube.com/@Thoms.Foolery', summary: 'YouTube channel' },
        { id: 'social-linkedin', label: 'LinkedIn', type: 'website', url: 'https://www.linkedin.com/in/jonathan-thoms-a43b65a4/', summary: 'LinkedIn profile' },
        { id: 'social-discord', label: 'Discord', type: 'website', url: 'https://discord.gg/84c7ut6cg6', summary: 'Discord server' },
        { id: 'lib-books', label: 'Books', type: 'library', url: '/library/#books', summary: 'Books I have read or am reading' },
        { id: 'lib-hardware', label: 'Hardware', type: 'library', url: '/library/#hardware', summary: 'Physical tools and equipment' },
        { id: 'lib-software', label: 'Software', type: 'library', url: '/library/#software', summary: 'Apps and programs I use' },
        { id: 'lib-tools', label: 'Tools', type: 'library', url: '/library/#tools', summary: 'Digital and physical utilities' },
        { id: 'lib-games', label: 'Games', type: 'library', url: '/library/#games', summary: 'Video games and board games' },
        { id: 'lib-creators', label: 'Creators', type: 'library', url: '/library/#creators', summary: 'People who inspire me' },
        { id: 'proj-active', label: 'Active Projects', type: 'project', url: '/projects/#active', summary: 'Current projects in active development' },
        { id: 'proj-drawing', label: 'Drawing Board', type: 'project', url: '/projects/#drawing-board', summary: 'Concepts and ideas in the early stages' },
        { id: 'proj-completed', label: 'Case Studies', type: 'project', url: '/projects/#case-studies', summary: 'Completed projects and post-mortems' },
        { id: 'manifesto-node', label: 'The Manifesto', type: 'article', url: '/articles/manifesto.html', summary: 'The foundational document' }
    ];
    data.nodes.push(...extraNodes);
    
    // 2D Atlas Hub clustering logic
    const themes = data.nodes.filter(n => n.type === 'theme');
    const rooms = {};
    let roomCounter = 0;

    themes.forEach((theme) => {
        const macroX = (roomCounter % 3) * 60;
        const macroZ = Math.floor(roomCounter / 3) * 60;
        const macroY = Math.sin(roomCounter) * 20;

        theme.isTheme = true;
        theme.isoX = macroX;
        theme.isoY = macroY;
        theme.isoZ = macroZ;

        rooms[theme.id] = {
            node: theme,
            baseX: macroX,
            baseZ: macroZ,
            baseY: macroY,
            children: []
        };
        roomCounter++;
    });

    const unchartedTheme = { id: 'hub-uncharted', label: 'Uncharted Abyss', type: 'theme', isTheme: true, isUncharted: true };
    const uX = (roomCounter % 3) * 60;
    const uZ = Math.floor(roomCounter / 3) * 60;
    const uY = Math.sin(roomCounter) * 20;
    unchartedTheme.isoX = uX; unchartedTheme.isoY = uY; unchartedTheme.isoZ = uZ;
    rooms['hub-uncharted'] = { node: unchartedTheme, baseX: uX, baseZ: uZ, baseY: uY, children: [] };
    data.nodes.push(unchartedTheme);
    themes.push(unchartedTheme);

    // Assign instances to rooms based on edges (allow duplication)
    data.edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;
        if (rooms[source] && data.nodes.find(n => n.id === target)) {
            if (!rooms[source].children.find(c => c.node.id === target)) {
                rooms[source].children.push({ node: data.nodes.find(n => n.id === target) });
            }
        } else if (rooms[target] && data.nodes.find(n => n.id === source)) {
            if (!rooms[target].children.find(c => c.node.id === source)) {
                rooms[target].children.push({ node: data.nodes.find(n => n.id === source) });
            }
        }
    });

    // Assign remaining nodes to uncharted if they have no parentRoomBase
    data.nodes.forEach(node => {
        if (!node.isTheme) {
            let assigned = false;
            for (const rId in rooms) {
                if (rooms[rId].children.find(c => c.node.id === node.id)) {
                    assigned = true;
                    break;
                }
            }
            if (!assigned) {
                // Attempt to assign to a theme based on node tags if possible
                let fallbackTheme = null;
                if (node.tags && node.tags.length > 0) {
                    for (const tag of node.tags) {
                        if (tag.toLowerCase() === 'theme' || tag.toLowerCase() === 'index' || tag.toLowerCase() === 'hub') continue;
                        const possibleTheme = themes.find(t => t.id === tag || t.label.toLowerCase() === tag.toLowerCase() || t.id.includes(tag));
                        if (possibleTheme) {
                            fallbackTheme = possibleTheme.id;
                            break;
                        }
                    }
                }
                if (fallbackTheme && rooms[fallbackTheme]) {
                    rooms[fallbackTheme].children.push({ node: node });
                } else {
                    node.isUncharted = true;
                    rooms['hub-uncharted'].children.push({ node: node });
                }
            }
        }
    });

    Object.values(rooms).forEach(room => {
        const maxPerFloor = 6;
        const numFloors = Math.ceil(room.children.length / maxPerFloor) || 1;
        room.numFloors = numFloors;
        
        room.children.forEach((childInst, i) => {
            const floorIndex = Math.floor(i / maxPerFloor);
            const indexOnFloor = i % maxPerFloor;
            const floorCount = Math.min(room.children.length - floorIndex * maxPerFloor, maxPerFloor);
            
            const ringRadius = 60; // Safe distance from center pillar and edge
            const angle = (indexOnFloor / floorCount) * Math.PI * 2 + (floorIndex * 0.4);
            const spread = 8.0;
            childInst.isoX = room.baseX + (Math.cos(angle) * ringRadius) / spread;
            childInst.isoZ = room.baseZ + (Math.sin(angle) * ringRadius) / spread;
            childInst.isoY = room.baseY + (floorIndex * 7.5); // spread=8.0 => 60 units world space
            childInst.floorIndex = floorIndex;
            childInst.parentRoomBase = room; 
        });
    });
    
    const matPedestal = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, clearcoat: 0.5, roughness: 0.4 });
    nodeMap = new Map(); // node.id -> Array of Meshes (module-level)
    
    // 1. Generate Hubs/Themes
    themes.forEach(node => {
        if (!nodeMap.has(node.id)) nodeMap.set(node.id, []);
        if (node.isoX === undefined) {
             node.isoX = Math.random() * 50;
             node.isoY = Math.random() * 20;
             node.isoZ = Math.random() * 50;
        }

        const spread = 8.0;
        const posX = node.isoX * spread;
        const posZ = node.isoZ * spread; 
        const posY = node.isoY * spread;
        
        node.pos3D = new THREE.Vector3(posX, posY, posZ);
        
        const uData = { 
            id: node.id, 
            label: node.label, 
            isTheme: true, 
            themeType: node.type,
            url: node.path || node.url,
            summary: node.summary || node.description || 'Enter to explore this node.',
            type: node.type,
            targetPos: node.pos3D.clone()
        };
        
        let mesh;
        if (node.isUncharted) {
            mesh = new THREE.Mesh(geoUncharted, matUnchartedHover);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.copy(node.pos3D);
        } else {
            const hubMat = matThemeHover.clone();
            hubMat.emissive.setHex(hubColors[node.id] || 0x38bdf8);
            hubMat.emissiveIntensity = 0.5;
            mesh = new THREE.Mesh(geoTheme, hubMat);
            mesh.position.copy(node.pos3D);
            mesh.position.y -= 2.5; 
        }
        
        const numFloors = rooms[node.id]?.numFloors || 1;
        for (let f = 1; f < numFloors; f++) {
            let floorMesh;
            if (node.isUncharted) {
                floorMesh = new THREE.Mesh(geoUncharted, matUnchartedHover);
                floorMesh.rotation.x = -Math.PI / 2;
            } else {
                const floorMat = matThemeHover.clone();
                floorMat.emissive.setHex(hubColors[node.id] || 0x38bdf8);
                floorMat.emissiveIntensity = 0.3;
                floorMesh = new THREE.Mesh(geoTheme, floorMat);
                floorMesh.rotation.y = f * 0.5;
            }
            floorMesh.position.copy(node.pos3D);
            floorMesh.position.y += (f * 60) - 2.5; 
            scene.add(floorMesh);
            
            let floorUData = Object.assign({}, uData);
            floorUData.targetPos = floorMesh.position.clone();
            floorMesh.userData = floorUData;
            meshes.push(floorMesh);
        }
        
        if (!node.isUncharted) {
            const pillarMat = matPedestal.clone();
            pillarMat.emissive.setHex(hubColors[node.id] || 0x38bdf8);
            pillarMat.emissiveIntensity = 0.1;
            
            const numFloors = Math.max(rooms[node.id]?.numFloors || 1, 1);
            const towerHeight = Math.max(numFloors - 1, 0.2) * 60;
            const pGeo = new THREE.CylinderGeometry(10, 10, towerHeight, 16);
            const pillar = new THREE.Mesh(pGeo, pillarMat);
            pillar.position.copy(node.pos3D);
            pillar.position.y += (towerHeight / 2) - 2.5; // base starts at base plate
            scene.add(pillar);
            
            let pillarUData = Object.assign({}, uData);
            pillarUData.targetPos = pillar.position.clone();
            pillar.userData = pillarUData;
            meshes.push(pillar);
            
            if (numFloors > 1) {
                // Spiral staircase: stepsPerFloor steps per 60-unit rise
                const stepsPerFloor = 16;
                const totalSteps = stepsPerFloor * (numFloors - 1);
                const risePerStep = 60 / stepsPerFloor; // = 3.75 units
                for (let s = 0; s < totalSteps; s++) {
                    const stepBox = new THREE.BoxGeometry(14, risePerStep * 0.9, 8);
                    const step = new THREE.Mesh(stepBox, pillarMat);
                    const angle = (s / stepsPerFloor) * Math.PI * 2; // full rotation per floor
                    step.position.copy(pillar.position);
                    step.position.y = (s * risePerStep) + risePerStep / 2; // evenly spaced
                    step.position.x += Math.cos(angle) * 14;
                    step.position.z += Math.sin(angle) * 14;
                    step.lookAt(new THREE.Vector3(pillar.position.x, step.position.y, pillar.position.z));
                    
                    // Make steps clickable — travel to the floor they lead to
                    const targetFloor = Math.floor(s / stepsPerFloor) + 1;
                    let stepUData = Object.assign({}, uData);
                    stepUData.targetPos = new THREE.Vector3(pillar.position.x, targetFloor * 60, pillar.position.z);
                    stepUData.label = 'Go to Floor ' + (targetFloor + 1);
                    step.userData = stepUData;
                    
                    scene.add(step);
                    meshes.push(step);
                }
                
                // Landing platform at each upper floor
                for (let f = 1; f < numFloors; f++) {
                    const platformBox = new THREE.BoxGeometry(34, 2, 34);
                    const platform = new THREE.Mesh(platformBox, pillarMat);
                    platform.position.copy(pillar.position);
                    platform.position.y = (f * 60) - 2.5;
                    scene.add(platform);
                }
            }
        }
        
        mesh.userData = uData;
        scene.add(mesh);
        meshes.push(mesh);
        nodeMap.get(node.id).push(mesh);
    });

    // 2. Generate Doors
    Object.values(rooms).forEach(room => {
        room.children.forEach(childInst => {
            const node = childInst.node;
            if (!nodeMap.has(node.id)) nodeMap.set(node.id, []);

            const spread = 8.0;
            const posX = childInst.isoX * spread;
            const posZ = childInst.isoZ * spread; 
            const posY = childInst.isoY * spread;
            childInst.pos3D = new THREE.Vector3(posX, posY, posZ);

            let nodeMat = matNodeArticle;
            if (node.type === 'topic') nodeMat = matNodeTopic;
            if (node.type === 'project') nodeMat = matNodeProject;
            if (node.type === 'library' || node.type === 'library-category') nodeMat = matNodeLibrary;
            if (node.type === 'website') nodeMat = matNodeWebsite;
            
            let mesh = new THREE.Mesh(geoNode, nodeMat);
            mesh.position.set(10, 0, 0); // Offset for hinge
            
            let doorGroup = new THREE.Group();
            doorGroup.add(mesh);
            doorGroup.position.copy(childInst.pos3D);
            doorGroup.position.y += 15;
            
            // Orient door
            if (childInst.parentRoomBase) {
                const centerX = childInst.parentRoomBase.baseX * spread;
                const centerZ = childInst.parentRoomBase.baseZ * spread;
                doorGroup.lookAt(new THREE.Vector3(childInst.pos3D.x * 2 - centerX, childInst.pos3D.y + 15, childInst.pos3D.z * 2 - centerZ));
                doorGroup.rotation.x = 0;
                doorGroup.rotation.z = 0;
            }
            
            // Offset the group itself back by 10 locally to counteract the mesh offset
            doorGroup.translateX(-10);
            const uData = { 
                id: node.id, 
                label: node.label, 
                isTheme: false, 
                parentThemeId: childInst.parentRoomBase ? childInst.parentRoomBase.node.id : 'hub-uncharted',
                floorIndex: childInst.floorIndex,
                themeType: node.type,
                url: node.path || node.url,
                summary: node.summary || node.description || 'Enter to explore this node.',
                type: node.type,
                targetPos: doorGroup.position.clone(),
                originalRot: doorGroup.rotation.clone(),
                doorGroup: doorGroup
            };
            mesh.userData = uData;

            // Pedestal
            let pedMesh = new THREE.Mesh(geoPedestal, matPedestal);
            pedMesh.position.copy(doorGroup.position);
            pedMesh.position.y -= 13; 
            const outDir = new THREE.Vector3(0, 0, 1).applyEuler(doorGroup.rotation);
            pedMesh.position.addScaledVector(outDir, 4);
            pedMesh.rotation.copy(doorGroup.rotation);
            
            scene.add(doorGroup);
            scene.add(pedMesh);
            meshes.push(mesh, pedMesh);
            
            pedMesh.userData = uData;
            
            nodeMap.get(node.id).push(mesh);
        });
    });
    
    // 3. Fast Travel Bridges
    const bridgeGroup = new THREE.Group();
    
    nodeMap.forEach((meshList, nodeId) => {
        if (meshList.length > 1 && !meshList[0].userData.isTheme) {
            for (let i = 0; i < meshList.length - 1; i++) {
                const m1 = meshList[i];
                const m2 = meshList[i+1];
                
                const pos1 = m1.userData.targetPos;
                const pos2 = m2.userData.targetPos;
                
                const dy = pos2.y - pos1.y;
                const dx = pos2.x - pos1.x;
                const dz = pos2.z - pos1.z;
                const horizDist = Math.sqrt(dx*dx + dz*dz);
                
                if (horizDist < 10) continue; // Prevent microscopic overlapping bridges
                
                const uDataBridge = {
                    id: `bridge-${m1.userData.id}-${m2.userData.id}`,
                    label1: `Bridge to ${m1.userData.label}`,
                    label2: `Bridge to ${m2.userData.label}`,
                    label: `Fast Travel to ${m2.userData.label}`,
                    isTheme: false,
                    isBridge: true,
                    target1: pos1.clone(),
                    target2: pos2.clone(),
                    summary: `A pathway connecting duplicate instances of ${m1.userData.label}.`,
                    url: null
                };
                
                if (Math.abs(dy) < 5) {
                    // Flat bridge
                    const bridge = new THREE.Mesh(baseBoxGeo, matBridge);
                    bridge.scale.set(20, 2, horizDist);
                    bridge.position.copy(pos1).lerp(pos2, 0.5);
                    bridge.position.y -= 15;
                    bridge.lookAt(new THREE.Vector3(pos2.x, bridge.position.y, pos2.z));
                    bridge.userData = uDataBridge;
                    bridgeGroup.add(bridge);
                    meshes.push(bridge);
                } else {
                    // Fixed-Size Stairs & Runway
                    const stepHeight = 5;
                    const numSteps = Math.floor(Math.abs(dy) / stepHeight);
                    let stepDepth = 10;
                    
                    // Prevent overshooting if the distance is too short
                    let stairHorizDist = numSteps * stepDepth;
                    if (stairHorizDist > horizDist) {
                        stepDepth = horizDist / numSteps;
                        stairHorizDist = horizDist;
                    }
                    
                    // Direction vector from pos1 to pos2
                    const dirX = dx / horizDist;
                    const dirZ = dz / horizDist;
                    
                    // The stairs start from the lower door and go UP
                    const lowerPos = dy > 0 ? pos1 : pos2;
                    const higherPos = dy > 0 ? pos2 : pos1;
                    
                    // Staircase base position (at the lower door)
                    const startX = lowerPos.x;
                    const startZ = lowerPos.z;
                    const startY = lowerPos.y - 15;
                    
                    // Direction of stairs travel
                    const dDirX = dy > 0 ? dirX : -dirX;
                    const dDirZ = dy > 0 ? dirZ : -dirZ;
                    
                    // Draw stairs
                    for (let s = 1; s <= numSteps; s++) {
                        const step = new THREE.Mesh(baseBoxGeo, matBridge);
                        step.scale.set(20, Math.abs(stepHeight), stepDepth);
                        
                        step.position.x = startX + dDirX * (s * stepDepth - stepDepth/2);
                        step.position.z = startZ + dDirZ * (s * stepDepth - stepDepth/2);
                        step.position.y = startY + (s * stepHeight - stepHeight/2);
                        
                        step.lookAt(new THREE.Vector3(higherPos.x, step.position.y, higherPos.z));
                        step.userData = uDataBridge;
                        bridgeGroup.add(step);
                        meshes.push(step);
                    }
                    
                    // Flat runway from top of stairs to the higher door
                    const endStairX = startX + dDirX * stairHorizDist;
                    const endStairZ = startZ + dDirZ * stairHorizDist;
                    const runwayLen = horizDist - stairHorizDist;
                    
                    if (runwayLen > 0) {
                        const runway = new THREE.Mesh(baseBoxGeo, matBridge);
                        runway.scale.set(20, 2, runwayLen);
                        
                        runway.position.x = endStairX + dDirX * (runwayLen / 2);
                        runway.position.z = endStairZ + dDirZ * (runwayLen / 2);
                        runway.position.y = higherPos.y - 15; // same height as higher door
                        
                        runway.lookAt(new THREE.Vector3(higherPos.x, runway.position.y, higherPos.z));
                        runway.userData = uDataBridge;
                        bridgeGroup.add(runway);
                        meshes.push(runway);
                    }
                }
            }
        }
    });
    scene.add(bridgeGroup);
    
    // Store original material on all meshes
    meshes.forEach(m => {
        m.userData.originalMat = m.material;
    });
    
    // Populate Dropdown
    roomSelector.innerHTML = '<option value="" disabled selected>Select Room...</option>';
    themes.forEach(theme => {
        const opt = document.createElement('option');
        opt.value = theme.id;
        opt.innerText = theme.label;
        roomSelector.appendChild(opt);
    });
    
    roomSelector.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        if (selectedId === 'travel') return;
        
        const targetMeshList = nodeMap.get(selectedId);
        if (targetMeshList && targetMeshList.length > 0) {
            triggerNodeTravel(targetMeshList[0]);
        }
    });

    // Initial establishing shot
    const firstTheme = themes.length > 0 ? themes[0] : null;
    if (firstTheme) {
        setRoomLabel(firstTheme.label, firstTheme.id);
        const targetPos = new THREE.Vector3(firstTheme.isoX * 8.0, firstTheme.isoY * 8.0, firstTheme.isoZ * 8.0);
        camera.position.set(targetPos.x + 300, targetPos.y + 200, targetPos.z + 400);
        gsap.to(camera.position, {
            x: targetPos.x,
            y: targetPos.y + 80,
            z: targetPos.z + 150,
            duration: 3.5,
            ease: "power2.out"
        });
        controls.target.copy(targetPos);
    } else {
        setRoomLabel("The Void", null);
    }
}

fetch('/graph.json')
    .then(r => r.json())
    .then(data => init3D(data));

let isDragging = false;
let isMouseDown = false;
let mouseDownPos = { x: 0, y: 0 };
let mouseMoved = false;

window.addEventListener('pointerdown', (e) => {
    isMouseDown = true;
    isDragging = false;
    mouseDownPos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointermove', (e) => {
    if (isMouseDown) {
        if (Math.abs(e.clientX - mouseDownPos.x) > 10 || Math.abs(e.clientY - mouseDownPos.y) > 10) {
            isDragging = true;
        }
    }
});

function triggerNodeTravel(targetMesh) {
    if (window.ACTIVE_NODE && window.ACTIVE_NODE !== targetMesh) {
        if (window.ACTIVE_NODE.userData && window.ACTIVE_NODE.userData.originalMat) {
            window.ACTIVE_NODE.material = window.ACTIVE_NODE.userData.originalMat;
        }
        if (!window.ACTIVE_NODE.userData.isTheme && !window.ACTIVE_NODE.userData.isBridge) {
            if (window.ACTIVE_NODE.userData.doorGroup) {
                gsap.to(window.ACTIVE_NODE.userData.doorGroup.rotation, { y: window.ACTIVE_NODE.userData.originalRot.y, duration: 1.5, ease: "power2.inOut" });
            }
        }
    }
    
    window.ACTIVE_NODE = targetMesh;
    
    const data = targetMesh.userData;
    let targetPos = data.targetPos || targetMesh.position;
    
    if (data.isBridge && data.target1 && data.target2) {
        const dist1 = camera.position.distanceTo(data.target1);
        const dist2 = camera.position.distanceTo(data.target2);
        targetPos = dist1 > dist2 ? data.target1 : data.target2;
        data.label = dist1 > dist2 ? data.label1 : data.label2;
    }

    const distance = camera.position.distanceTo(targetPos);
    const duration = Math.min(2.4, Math.max(0.8, distance / 500));
    
    controls.enabled = false;
    
    const normal = new THREE.Vector3();
    targetMesh.getWorldDirection(normal);
    const right = new THREE.Vector3().crossVectors(normal, new THREE.Vector3(0, 1, 0)).normalize();
    const framingOffset = (!data.isTheme && !data.isBridge) ? right.multiplyScalar(-15) : new THREE.Vector3(0,0,0); 

    gsap.to(controls.target, {
        x: targetPos.x + framingOffset.x,
        y: targetPos.y,
        z: targetPos.z + framingOffset.z,
        duration: duration,
        ease: "power3.inOut"
    });
    
    // Color Shift
    const themeId = data.isTheme ? data.id : (data.parentThemeId || 'hub-uncharted');
    let targetColor = new THREE.Color(0x0f172a);
    if (themeId !== 'hub-uncharted' && typeof hubColors !== 'undefined' && hubColors[themeId]) {
        targetColor.setHex(hubColors[themeId]);
    }
    targetColor.lerp(new THREE.Color(0x0f172a), 0.6); // blend down
    if (scene.fog) {
        gsap.to(scene.fog.color, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 2.0 });
    }
    if (scene.background) {
        gsap.to(scene.background, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 2.0 });
    }
    if (typeof ambientLight !== 'undefined') {
        const lightColor = targetColor.clone().lerp(new THREE.Color(0xffffff), 0.3);
        gsap.to(ambientLight.color, { r: lightColor.r, g: lightColor.g, b: lightColor.b, duration: 2.0 });
    }
    
    if (data.isBridge) {
        gsap.to(camera.position, {
            x: targetPos.x + 30,
            y: targetPos.y + 80,
            z: targetPos.z + 120,
            duration: duration,
            ease: "power3.inOut",
            onComplete: () => controls.enabled = true
        });
        sidebar.style.right = '-400px';
        setRoomLabel("Traveling to " + data.label.replace("Bridge to ", ""), null);
        return;
    }
    
    const offset = normal.clone().multiplyScalar(45);
    
    gsap.to(camera.position, {
        x: targetPos.x + offset.x + framingOffset.x,
        y: targetPos.y + 10,
        z: targetPos.z + offset.z + framingOffset.z,
        duration: duration,
        ease: "power3.inOut",
        onComplete: () => controls.enabled = true
    });
    
    if (!data.isTheme && !data.isBridge) {
        if (targetMesh.userData.doorGroup) {
            gsap.to(targetMesh.userData.doorGroup.rotation, {
                y: targetMesh.userData.originalRot.y + Math.PI / 2.2, 
                duration: 1.5, 
                ease: "power2.inOut"
            });
        }
    }

    setRoomLabel(data.label, data.isTheme ? data.id : (data.parentThemeId ? data.parentThemeId : null));
    sidebarType.innerText = data.isTheme ? 'Hallway / Hub' : 'Room / Document';
    sidebarTitle.innerText = data.label;
    sidebarDesc.innerText = data.summary;
    if (data.url) {
        sidebarLink.style.display = 'block';
        sidebarLink.href = data.url;
        sidebarLink.innerText = data.isTheme ? 'Enter Hallway' : 'Enter Room';
    } else {
        sidebarLink.style.display = 'none';
    }
    
    let hubBtn = document.getElementById('hub-return-btn');
    if (!hubBtn) {
        hubBtn = document.createElement('button');
        hubBtn.id = 'hub-return-btn';
        hubBtn.style.marginTop = '1rem';
        hubBtn.style.width = '100%';
        hubBtn.style.padding = '0.75rem';
        hubBtn.style.background = 'transparent';
        hubBtn.style.border = '1px solid var(--accent-color)';
        hubBtn.style.color = 'var(--accent-color)';
        hubBtn.style.cursor = 'pointer';
        hubBtn.style.borderRadius = '4px';
        hubBtn.innerText = 'Return to Hub View';
        
        hubBtn.addEventListener('click', () => {
            if (window.ACTIVE_NODE && window.ACTIVE_NODE.userData.parentThemeId) {
                const targetThemeId = window.ACTIVE_NODE.userData.parentThemeId;
                const themeMeshList = nodeMap.get(targetThemeId);
                if (themeMeshList && themeMeshList.length > 0) {
                    triggerNodeTravel(themeMeshList[0]);
                }
            }
        });
        sidebarDesc.parentNode.appendChild(hubBtn);
    }
    hubBtn.style.display = (!data.isTheme && data.parentThemeId && data.parentThemeId !== 'hub-uncharted') ? 'block' : 'none';
    
    sidebar.style.right = '0';
}

window.addEventListener('pointerup', (e) => {
    isMouseDown = false;
    if (e.target.closest('#info-sidebar') || e.target.closest('a') || e.target.closest('#controls-box')) return;
    
    if (!isDragging) {
        if (INTERSECTED) {
            triggerNodeTravel(INTERSECTED);
        } else {
            sidebar.style.right = '-400px';
            if (window.ACTIVE_NODE) {
                if (window.ACTIVE_NODE.userData && window.ACTIVE_NODE.userData.originalMat) {
                    window.ACTIVE_NODE.material = window.ACTIVE_NODE.userData.originalMat;
                }
                if (!window.ACTIVE_NODE.userData.isTheme && !window.ACTIVE_NODE.userData.isBridge) {
                    if (window.ACTIVE_NODE.userData.doorGroup) {
                        gsap.to(window.ACTIVE_NODE.userData.doorGroup.rotation, { y: window.ACTIVE_NODE.userData.originalRot.y, duration: 1.5, ease: "power2.inOut" });
                    }
                }
                window.ACTIVE_NODE = null;
            }
        }
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (typeof composer !== 'undefined') composer.setSize(window.innerWidth, window.innerHeight);
});

const tooltip = document.createElement('div');
tooltip.id = 'labyrinth-tooltip';
tooltip.style.position = 'absolute';
tooltip.style.padding = '8px 12px';
tooltip.style.background = 'rgba(15, 23, 42, 0.9)';
tooltip.style.color = '#fff';
tooltip.style.border = '1px solid #38bdf8';
tooltip.style.borderRadius = '4px';
tooltip.style.pointerEvents = 'none';
tooltip.style.opacity = '0';
tooltip.style.transition = 'opacity 0.2s';
tooltip.style.zIndex = '1000';
tooltip.style.fontFamily = 'Inter, sans-serif';
tooltip.style.fontSize = '14px';
document.body.appendChild(tooltip);

document.addEventListener('pointermove', (e) => {
    if (e.target.closest('#info-sidebar') || e.target.closest('a') || e.target.closest('#controls-box') || e.target.closest('#room-selector')) {
        tooltip.style.opacity = '0';
        return;
    }
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseMoved = true;
    
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
});

function handleRaycast() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (INTERSECTED != obj) {
            if (INTERSECTED && INTERSECTED !== window.ACTIVE_NODE) {
                if (INTERSECTED.userData && INTERSECTED.userData.originalMat) {
                    INTERSECTED.material = INTERSECTED.userData.originalMat;
                }
            }
            INTERSECTED = obj;
            let hoverMat = matThemeHover;
            if (INTERSECTED.userData) {
                if (INTERSECTED.userData.isUncharted) hoverMat = matUnchartedHover;
                else if (INTERSECTED.userData.isBridge) hoverMat = matBridgeHover;
                else if (!INTERSECTED.userData.isTheme) hoverMat = matNodeHover;
            }
            INTERSECTED.material = hoverMat;
            document.body.style.cursor = 'pointer';
            
            if (INTERSECTED.userData && INTERSECTED.userData.label) {
                tooltip.innerText = INTERSECTED.userData.label;
                tooltip.style.opacity = '1';
            }
        }
    } else {
        if (INTERSECTED && INTERSECTED !== window.ACTIVE_NODE) {
            if (INTERSECTED.userData && INTERSECTED.userData.originalMat) {
                INTERSECTED.material = INTERSECTED.userData.originalMat;
            }
            INTERSECTED = null;
            document.body.style.cursor = 'default';
            tooltip.style.opacity = '0';
        } else if (INTERSECTED === window.ACTIVE_NODE) {
            INTERSECTED = null;
            document.body.style.cursor = 'default';
            tooltip.style.opacity = '0';
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (typeof particles !== 'undefined' && particleMat.uniforms) {
        particleMat.uniforms.time.value += 0.016;
    }
    
    if (mouseMoved) {
        handleRaycast();
        mouseMoved = false;
    }
    
    if (typeof composer !== 'undefined') {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

animate();

window.addEventListener('keydown', (e) => {
    if (!window.ACTIVE_NODE) return;
    const uData = window.ACTIVE_NODE.userData;
    if (!uData || uData.isBridge) return;
    
    // Allow up/down when a theme floor is selected, but not left/right
    const isLeft = e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a';
    const isRight = e.key === 'ArrowRight' || e.key.toLowerCase() === 'd';
    const isUp = e.key === 'ArrowUp' || e.key.toLowerCase() === 'w';
    const isDown = e.key === 'ArrowDown' || e.key.toLowerCase() === 's';
    
    if (uData.isTheme && (isLeft || isRight)) return;
    
    const currentThemeId = uData.parentThemeId;
    const currentFloor = uData.floorIndex;
    if (!currentThemeId) return;
    
    const siblings = [];
    meshes.forEach(m => {
        // Find only doors (exclude pedestals, bridges, and themes)
        if (m.userData && !m.userData.isTheme && !m.userData.isBridge && m.userData.parentThemeId === currentThemeId && m.userData.doorGroup) {
            siblings.push(m);
        }
    });
    
    if (isLeft || isRight || isUp || isDown) {
        e.preventDefault(); // Prevent default browser scrolling which can intercept inputs
    }
    
    if (isLeft || isRight) {
        const floorSiblings = siblings.filter(s => s.userData.floorIndex === currentFloor);
        if (floorSiblings.length <= 1) return;
        
        let centerX = 0, centerZ = 0;
        const themeMeshList = nodeMap.get(currentThemeId);
        if (themeMeshList && themeMeshList.length > 0) {
            centerX = themeMeshList[0].position.x;
            centerZ = themeMeshList[0].position.z;
        }
        
        // Calculate angles
        const angles = floorSiblings.map(s => {
            let angle = Math.atan2(s.userData.targetPos.z - centerZ, s.userData.targetPos.x - centerX);
            if (angle < 0) angle += Math.PI * 2;
            return { mesh: s, angle: angle };
        });
        
        angles.sort((a, b) => a.angle - b.angle);
        
        let idx = angles.findIndex(a => a.mesh.userData.doorGroup === window.ACTIVE_NODE.userData.doorGroup);
        if (idx === -1) return;
        
        // Ensure consistent directional movement around the ring
        if (isLeft) idx = (idx - 1 + angles.length) % angles.length;
        else if (isRight) idx = (idx + 1) % angles.length;
        
        triggerNodeTravel(angles[idx].mesh);
        
    } else if (isUp || isDown) {
        const targetFloor = isUp ? currentFloor + 1 : currentFloor - 1;
        const floorSiblings = siblings.filter(s => s.userData.floorIndex === targetFloor);
        if (floorSiblings.length === 0) return;
        
        const curPos = window.ACTIVE_NODE.userData.targetPos;
        let closest = floorSiblings[0];
        let minDist = Infinity;
        floorSiblings.forEach(s => {
            const dx = s.userData.targetPos.x - curPos.x;
            const dz = s.userData.targetPos.z - curPos.z;
            const dist = dx*dx + dz*dz;
            if (dist < minDist) {
                minDist = dist;
                closest = s;
            }
        });
        
        triggerNodeTravel(closest);
    }
});
