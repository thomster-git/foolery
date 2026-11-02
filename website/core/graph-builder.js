/**
 * ============================================================
 * Graph Builder
 * ============================================================
 *
 * Builds the Atlas knowledge graph around the 4 core site pillars
 * connected to the central "Thoms Foolery" hub:
 *   1. Articles (/articles/)
 *   2. Tools (/tools/)
 *   3. Interests (/interests/)
 *   4. Professional Resume (/resume/)
 *
 * Output:
 * {
 *   nodes: [],
 *   edges: []
 * }
 */

export default class GraphBuilder {

    build(content) {

        const graph = {
            nodes: [],
            edges: []
        };

        const tags = new Set();

        // Central Site Root Hub
        graph.nodes.push({
            id: "hub-global",
            label: "Thoms Foolery",
            type: "hub",
            url: "/graph/",
            summary: "The Digital Garden & Interconnected Systems Lab of Jonathan Thoms — Articles, Interactive Tools, Interests, and Professional Resume."
        });

        // Tier 1: The 4 Main Site Pillars directly connected to Thoms Foolery
        const mainPillars = [
            {
                id: "pillar-articles",
                label: "Articles",
                type: "pillar",
                pillarKey: "articles",
                url: "/articles/",
                summary: "Long-form personal essays, crisis post-mortems, and technical systems architecture deep dives."
            },
            {
                id: "pillar-tools",
                label: "Tools",
                type: "pillar",
                pillarKey: "tools",
                url: "/tools/",
                summary: "11 interactive web applications, sports telemetry analyzers, 3D simulators, and game compendiums."
            },
            {
                id: "pillar-interests",
                label: "Interests",
                type: "pillar",
                pillarKey: "interests",
                url: "/interests/",
                summary: "The Curiosity Taxonomy — sports team backings, video games, music & acoustic engineering, electronics/homelab, digital tools, and entertainment."
            },
            {
                id: "pillar-resume",
                label: "Professional Resume",
                type: "pillar",
                pillarKey: "resume",
                url: "/resume/",
                summary: "Mechanical Engineering (B.Eng.) background, mining operations, enterprise IT coordination, EtchCentric studio, and systems consulting."
            }
        ];

        mainPillars.forEach(pillar => {
            graph.nodes.push(pillar);
            graph.edges.push({
                source: "hub-global",
                target: pillar.id,
                relation: "site-pillar"
            });
        });

        // Tier 2A: Interactive Tools (/tools/) under pillar-tools
        const siteTools = [
            {
                id: "tool-f1-calculator",
                label: "F1 2026 Title Calculator",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/f1-championship-calculator/",
                summary: "2026 Formula 1 World Drivers' & Constructors' Championship clinch scenario calculator and remaining race simulator."
            },
            {
                id: "tool-umpire-simulator",
                label: "MLB Umpire Simulator",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/umpire-simulator/",
                summary: "First-person 3D perspective MLB pitch simulator with Statcast kinematics and 3D strike-zone evaluation."
            },
            {
                id: "tool-ocarina",
                label: "12-Hole Ocarina Studio",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/ocarina/",
                summary: "Interactive 12-hole ocarina fingering chart, live Web Audio pitch tuner, Zelda songbook, and OBS stream overlay."
            },
            {
                id: "tool-dragonwilds",
                label: "Dragonwilds Guide",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/dragonwilds-tracker/",
                summary: "RuneScape: Dragonwilds Chapters 1–11 progression guide, Ascension Shards tracker, Fishing Guide, and vault respawn timers."
            },
            {
                id: "tool-nhl-analyzer",
                label: "NHL Trend Analyzer",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/nhl-trend-analyzer/",
                summary: "Compare all 32 NHL teams across 25 metrics including Goal Differential, Points Pace, Special Teams Index, and PDO."
            },
            {
                id: "tool-nfl-analyzer",
                label: "NFL Trend Analyzer",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/nfl-trend-analyzer/",
                summary: "Compare all 32 NFL franchises across 26 metrics including Point Differential, Pythagorean Win %, First Downs, and Turnovers."
            },
            {
                id: "tool-mlb-analyzer",
                label: "MLB Trend Analyzer",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/baseball-trend-analyzer/",
                summary: "Multi-season (2016–2026) MLB 162-game team analyzer across 20 sabermetric and situational metrics."
            },
            {
                id: "tool-postseason-mlb",
                label: "MLB Playoff Momentum",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/postseason-baseball-analyzer/",
                summary: "Postseason Momentum Index (PMI), Fire & Ice quadrants, and round-synchronized rest recovery trajectories."
            },
            {
                id: "tool-tier-list",
                label: "Tier List Creator",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/tier-list/",
                summary: "Drag-and-drop S-to-F tier list maker with clipboard paste and high-resolution PNG export."
            },
            {
                id: "tool-ffx-tracker",
                label: "FFX 100% Tracker",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/ffx-tracker/",
                summary: "Final Fantasy X completionist checklist covering Al Bhed Primers, Celestial Weapons, and Monster Arena creations."
            },
            {
                id: "tool-stream-schedule",
                label: "Live Stream Schedule",
                type: "site-tool",
                parentPillar: "pillar-tools",
                url: "/tools/stream-schedule/",
                summary: "Multi-platform Twitch, YouTube, and Kick broadcast schedule automatically synced to the viewer's local timezone."
            }
        ];

        siteTools.forEach(tool => {
            graph.nodes.push(tool);
            graph.edges.push({
                source: "pillar-tools",
                target: tool.id,
                relation: "pillar-member"
            });
        });

        // Tier 2B: Interests & Obsessions (/interests/) under pillar-interests
        const siteInterests = [
            {
                id: "interest-sports",
                label: "Sports & Team Backings",
                type: "interest",
                parentPillar: "pillar-interests",
                url: "/interests/#sports",
                summary: "Toronto Blue Jays (MLB), Montreal Canadiens (NHL), Buffalo Bills (NFL), and Formula 1 telemetry & strategy."
            },
            {
                id: "interest-video-games",
                label: "Video Games & Compendiums",
                type: "interest",
                parentPillar: "pillar-interests",
                url: "/interests/#video-games",
                summary: "RuneScape: Dragonwilds, The Legend of Zelda: Ocarina of Time, Final Fantasy X, and deep progression mechanics."
            },
            {
                id: "interest-music",
                label: "Music & Acoustic Engineering",
                type: "interest",
                parentPillar: "pillar-interests",
                url: "/interests/#music",
                summary: "12-hole ocarina performance, concert band brass/woodwinds, ear training, and Web Audio synthesis."
            },
            {
                id: "interest-electronics",
                label: "Electronics & Homelab",
                type: "interest",
                parentPillar: "pillar-interests",
                url: "/interests/#electronics",
                summary: "Custom white-box Proxmox servers, PC hardware builds, self-hosted infrastructure, and EtchCentric laser engraving."
            },
            {
                id: "interest-digital-tools",
                label: "Digital Tools & Automation",
                type: "interest",
                parentPillar: "pillar-interests",
                url: "/interests/#digital-tools",
                summary: "Project Atlas static graph engine, autonomous Discord bots, Python data pipelines, and AI agent workflows."
            },
            {
                id: "interest-entertainment",
                label: "Entertainment & Streaming",
                type: "interest",
                parentPillar: "pillar-interests",
                url: "/interests/#entertainment",
                summary: "Live community streaming on Twitch/YouTube/Kick, tabletop strategy, and sci-fi worldbuilding."
            }
        ];

        siteInterests.forEach(interest => {
            graph.nodes.push(interest);
            graph.edges.push({
                source: "pillar-interests",
                target: interest.id,
                relation: "pillar-member"
            });
        });

        // Tier 2C: Professional Resume Milestones (/resume/) under pillar-resume
        const resumeItems = [
            {
                id: "resume-consulting",
                label: "Systems & IT Consulting",
                type: "resume-item",
                parentPillar: "pillar-resume",
                url: "/resume/",
                summary: "Keel Systems & independent consulting — workflow mapping, Discord team ecosystems, SharePoint/Power Automate, and pragmatic KPI design."
            },
            {
                id: "resume-it-coordinator",
                label: "Mine IT Coordinator",
                type: "resume-item",
                parentPillar: "pillar-resume",
                url: "/resume/",
                summary: "Enterprise infrastructure, custom white-box Proxmox server architecture, vendor selection, and zero-ransom Akira disaster recovery."
            },
            {
                id: "resume-mining-engineering",
                label: "Mining & Project Engineering",
                type: "resume-item",
                parentPillar: "pillar-resume",
                url: "/resume/",
                summary: "Junior Mining Engineer, Mobile Maintenance Planner, Junior Project Engineer, and QA/QC Civil Inspector across industrial operations."
            },
            {
                id: "resume-etchcentric",
                label: "EtchCentric Laser Studio",
                type: "resume-item",
                parentPillar: "pillar-resume",
                url: "/resume/",
                summary: "Founder of EtchCentric Creations — custom laser engraving, CAD design, production workflows, and small-business operations."
            },
            {
                id: "resume-beng",
                label: "B.Eng. Mechanical Engineering",
                type: "resume-item",
                parentPillar: "pillar-resume",
                url: "/resume/",
                summary: "Memorial University of Newfoundland (2011–2016) — engineering design, systems analysis, and Pennecon co-op engineering terms."
            },
            {
                id: "resume-aviation",
                label: "Glider & Private Pilot",
                type: "resume-item",
                parentPillar: "pillar-resume",
                url: "/resume/",
                summary: "Royal Canadian Air Cadets — Glider Pilot, Private Pilot licence, aircraft maintenance course, and senior band leadership."
            }
        ];

        resumeItems.forEach(item => {
            graph.nodes.push(item);
            graph.edges.push({
                source: "pillar-resume",
                target: item.id,
                relation: "pillar-member"
            });
        });

        // Exclude library items and legacy topic/theme stubs from the knowledge graph
        const excludedTypes = new Set(["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "tv-show", "topic", "theme"]);
        const publishedContent = content.filter(obj => obj.metadata?.status !== "draft" && !excludedTypes.has(obj.metadata?.type));
        const publishedIds = new Set(publishedContent.map(obj => obj.metadata.id));

        publishedContent.forEach(object => {
            const isArticle = object.metadata.type === "article";

            graph.nodes.push({
                id: object.metadata.id,
                label: object.metadata.title,
                type: object.metadata.type,
                parentPillar: isArticle ? "pillar-articles" : undefined,
                url: object.url,
                summary: object.metadata.summary,
                tags: object.metadata.tags || []
            });

            // Connect every published article to the Articles pillar
            if (isArticle) {
                graph.edges.push({
                    source: "pillar-articles",
                    target: object.metadata.id,
                    relation: "pillar-member"
                });
            }

            Object.entries(object.links || {})
                .forEach(([relation, targets]) => {
                    targets.forEach(target => {
                        if (target.metadata?.id && publishedIds.has(target.metadata.id)) {
                            graph.edges.push({
                                source: object.metadata.id,
                                target: target.metadata.id,
                                relation
                            });
                        }
                    });
                });

            // Synthesize tag edges
            if (object.metadata.tags && Array.isArray(object.metadata.tags)) {
                object.metadata.tags.forEach(tag => {
                    tags.add(tag);
                    graph.edges.push({
                        source: object.metadata.id,
                        target: `tag-${tag}`,
                        relation: "tags"
                    });
                });
            }
        });

        // Cross-Pillar Connections ("Everything Is Connected")
        // Links between Articles, Tools, Interests, and Professional Resume items
        const crossConnections = [
            // Interests <-> Tools
            ["interest-sports", "tool-f1-calculator"],
            ["interest-sports", "tool-umpire-simulator"],
            ["interest-sports", "tool-nhl-analyzer"],
            ["interest-sports", "tool-nfl-analyzer"],
            ["interest-sports", "tool-mlb-analyzer"],
            ["interest-sports", "tool-postseason-mlb"],
            ["interest-video-games", "tool-dragonwilds"],
            ["interest-video-games", "tool-ffx-tracker"],
            ["interest-video-games", "tool-ocarina"],
            ["interest-video-games", "tool-stream-schedule"],
            ["interest-music", "tool-ocarina"],
            ["interest-digital-tools", "tool-tier-list"],
            ["interest-entertainment", "tool-stream-schedule"],
            ["interest-entertainment", "tool-tier-list"],

            // Interests <-> Articles
            ["interest-electronics", "sensible-infrastructure-and-white-box-servers"],
            ["interest-electronics", "my-story-with-the-akira-ransomware-attack"],
            ["interest-digital-tools", "building-a-comprehensive-discord-ecosystem"],
            ["interest-digital-tools", "discord-vs-corporate-comms"],
            ["interest-digital-tools", "manifesto"],
            ["interest-sports", "building-a-comprehensive-discord-ecosystem"],

            // Resume <-> Articles & Interests
            ["resume-consulting", "discord-vs-corporate-comms"],
            ["resume-consulting", "sensible-infrastructure-and-white-box-servers"],
            ["resume-consulting", "building-a-comprehensive-discord-ecosystem"],
            ["resume-consulting", "interest-digital-tools"],
            ["resume-it-coordinator", "my-story-with-the-akira-ransomware-attack"],
            ["resume-it-coordinator", "sensible-infrastructure-and-white-box-servers"],
            ["resume-it-coordinator", "interest-electronics"],
            ["resume-mining-engineering", "my-story-with-the-akira-ransomware-attack"],
            ["resume-mining-engineering", "sensible-infrastructure-and-white-box-servers"],
            ["resume-etchcentric", "interest-electronics"],
            ["resume-beng", "manifesto"],
            ["resume-beng", "my-story-with-the-grade-9-french-test"],
            ["resume-aviation", "interest-music"]
        ];

        const allNodeIds = new Set(graph.nodes.map(n => n.id));
        crossConnections.forEach(([source, target]) => {
            if (allNodeIds.has(source) && allNodeIds.has(target)) {
                graph.edges.push({
                    source,
                    target,
                    relation: "cross-connection"
                });
            }
        });

        // Add tag nodes for tag pages
        tags.forEach(tag => {
            graph.nodes.push({
                id: `tag-${tag}`,
                label: `#${tag}`,
                type: "tag",
                url: `/tags/${tag}.html`,
                summary: `Content tagged with ${tag}`
            });
        });

        return graph;

    }

}
