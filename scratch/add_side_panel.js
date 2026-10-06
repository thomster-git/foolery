import fs from 'fs';

const path = '/home/keel/Project-Atlas-main/website/templates/layouts/resume.html';
const html = fs.readFileSync(path, 'utf8');

const nodes = [
    { year: '1993', title: 'Born', skills: ['Adaptability', 'Resilience'], bullets: '<li>Born in Carbonear, Newfoundland.</li>' },
    { year: '1998', title: 'Kindergarten', skills: ['Early Learning', 'Socialization'], bullets: '<li>Started kindergarten in St. John\'s.</li>' },
    { year: '1999', title: 'Moved to Carbonear', skills: ['Adaptability', 'Transition Management'], bullets: '<li>Moved to Carbonear for Grade 1.</li>' },
    { year: '2002', title: 'Grade 4', skills: ['Academic Excellence', 'Focus'], bullets: '<li>Highest grade achieved in Grade 4 in my school.</li>' },
    
    // 2004
    { year: '2004', title: 'School Band', skills: ['Musical Proficiency', 'Discipline', 'Teamwork'], bullets: '<li>Started playing clarinet in the school band.</li>' },
    { year: '2004', title: 'Math Placement', skills: ['Analytical Thinking', 'Mathematics', 'Problem Solving'], bullets: '<li>Placed in the top 85th percentile in provincial math placement testing (highest in the school).</li>' },
    
    // 2005
    { year: '2005', title: 'Air Cadets', skills: ['Leadership', 'Discipline', 'Chain of Command'], bullets: '<li>Turned 12 and joined air cadets.</li>' },
    
    // 2006
    { year: '2006', title: 'Lego Robotics', skills: ['Robotics', 'Teamwork', 'Logical Programming', 'Competition'], bullets: '<li>Joined lego robotics and went to the world competition in Atlanta, Georgia. Came 2nd in the teams relay category, matching with other teams where each team completed a portion of the track.</li>' },
    { year: '2006', title: 'Cadets Band', skills: ['Musical Proficiency', 'Rapid Learning', 'Performance'], bullets: '<li>Joined the Air Cadets band in my second year, naturally excelling at the snare drum and performing rolls on the first day.</li>' },
    { year: '2006', title: 'Drama Club', skills: ['Public Speaking', 'Creativity', 'Confidence'], bullets: '<li>Participated in Grade 8 Drama Club.</li>' },

    // 2007
    { year: '2007', title: 'Lego Robotics Senior Year', skills: ['Mentorship', 'Robotics', 'Project Execution'], bullets: '<li>Senior year of lego robotics, once again traveled to the world competition in Atlanta, Georgia.</li>' },
    { year: '2007', title: 'Social Studies', skills: ['History', 'Academic Excellence', 'Research'], bullets: '<li>Achieved the highest grade in social studies.</li>' },
    { year: '2007', title: 'Drama Club', skills: ['Acting', 'Public Speaking', 'Team Success'], bullets: '<li>Participated in Grade 9 Drama Club; won Best Actor in a Supporting Role, and the club won Best Play.</li>' },

    // 2009 & 2010
    { year: '2009', title: 'Aircraft Maintenance Engineering Course', skills: ['Aviation Mechanics', 'Technical Learning', 'Hands-on Engineering'], bullets: '<li>Completed aircraft maintenance engineering course through air cadets (6 week program).</li>' },
    { year: '2010', title: 'Glider Pilot', skills: ['Aviation', 'Focus', 'Crisis Management', 'Spatial Awareness'], bullets: '<li>Obtained a glider pilot license.</li>' },
    
    // 2011
    { year: '2011', title: 'High School Graduate', skills: ['Academic Excellence', 'Goal Achievement'], bullets: '<li>Graduated high school with honours.</li>' },
    { year: '2011', title: 'Private Pilot', skills: ['Aviation', 'Regulatory Compliance', 'Risk Management'], bullets: '<li>Obtained a private pilot license.</li>' },

    // 2012
    { year: '2012', title: 'Air Cadets Band Senior', skills: ['Leadership', 'Mentorship', 'Loyalty'], bullets: '<li>Remained highly involved in the cadets band until age 19.</li><li>Returned to uniform at 19 to march in the November 11th parade in Carbonear to help fill key missing roles.</li>' },
    
    // 2013
    { year: '2013', title: 'Student Project Engineer', skills: ['CAD Design', '3D Printing', 'Mechanical Engineering', 'Client Coordination', 'Prototyping'], bullets: '<li>Jan - May 2013: Student Project Engineer for Industrial Outreach Group (a small internal student engineering company run by MUN).</li><li>Using CAD to create 3D models of designs, exported to .stl file format, and 3D printed/laser cut for clients (shampoo helper for severe arthritis, circuit board container).</li><li>Chapman\'s Bakery: Chocolate coating machine modifications to compensate for chocolate recipe using paraffin wax.</li><li>EverGreen Recycling: Designed a bottle/can crusher to reduce the volume of bottles/cans to a specific percentage to fit more product in bags while maintaining specifications for crushing limits.</li>' },
    { year: '2013', title: 'Network Technician', skills: ['Ticketing Systems', 'Field Support', 'Telecommunications (POTS)', 'Customer Service'], bullets: '<li>Sept - Dec 2013: Network Technician for Bell Aliant on a student work term.</li><li>Logging in and checking system submitted tickets submitted by technicians to perform in the morning.</li><li>Receiving calls and coordinating with the technicians out in the field.</li><li>Worked with POTS punching in corresponding terminals to provide clients with their service.</li><li>Also pulled wires when clients cancelled their service.</li>' },

    // 2014 & 2015
    { year: '2014', title: 'Student Project Engineer (Pennecon)', skills: ['Civil Engineering', 'Project Management', 'Site Coordination'], bullets: '<li>May - Sept 2014: First work term as a Student Project Engineer for Pennecon M&M Engineering.</li><li>Dec 2014: Began second work term for Pennecon.</li>' },
    { year: '2015', title: 'Student Project Engineer (Pennecon)', skills: ['Engineering Execution', 'Documentation', 'Safety Compliance'], bullets: '<li>May 2015: Concluded second work term as a Student Project Engineer for Pennecon M&M Engineering.</li>' },
    
    // 2016
    { year: '2016', title: 'University Graduate', skills: ['Mechanical Engineering Degree', 'Perseverance', 'Complex Problem Solving'], bullets: '<li>Graduated university with a mechanical engineering degree.</li>' },
    { year: '2016', title: 'Chill Staff (Dairy Queen)', skills: ['Customer Service', 'Cash Handling', 'Time Management', 'High-Pressure Environments'], bullets: '<li>Sept 2016 - March 2017: Joined Dairy Queen as Chill Staff.</li><li>Delivered fast, accurate, and friendly service in a busy restaurant environment while handling cash and cleaning duties.</li>' },

    // 2017 & 2019
    { year: '2017', title: 'QA/QC Civil Inspector', skills: ['Quality Control', 'Civil Construction', 'Regulatory Compliance', 'Materials Testing'], bullets: '<li>Jun - Sep 2017: QA/QC Civil Inspector.</li><li>Inspected civil construction work to ensure compliance with drawings, specifications, and regulatory requirements.</li><li>Prepared inspection reports and punch lists, highlighting non-conformances and opportunities for improvement.</li><li>Coordinated with supervisors and equipment operators to resolve issues while keeping safety and environmental requirements front of mind.</li><li>Performed basic materials testing and quality checks to verify workmanship.</li>' },
    { year: '2019', title: 'QA/QC Civil Inspector', skills: ['Quality Assurance', 'Punch Lists', 'Environmental Safety', 'Cross-functional Communication'], bullets: '<li>Apr - Jun 2019: QA/QC Civil Inspector.</li><li>Inspected civil construction work to ensure compliance with drawings, specifications, and regulatory requirements.</li><li>Prepared inspection reports and punch lists, highlighting non-conformances and opportunities for improvement.</li><li>Coordinated with supervisors and equipment operators to resolve issues while keeping safety and environmental requirements front of mind.</li><li>Performed basic materials testing and quality checks to verify workmanship.</li>' },
    
    // 2020
    { year: '2020', title: 'Junior Project Engineer', skills: ['Project Planning', 'Cost Tracking', 'Risk Mitigation', 'Contractor Coordination', 'Scheduling'], bullets: '<li>Jun 2019 - Jan 2021: Junior Project Engineer.</li><li>Supported civil and infrastructure projects from planning through execution, including estimating, scheduling, and cost tracking.</li><li>Coordinated with contractors and vendors, ran site inspections, and kept documentation (reports, drawings, specs) up to date.</li><li>Helped identify project risks and contributed to mitigation plans.</li>' },

    // 2021
    { year: '2021', title: 'Junior Mining Engineer', bullets: '<li>Jan - Oct 2021: Junior Mining Engineer.</li><li>Designed mine roads and layouts and prepared drawings and files for surveyors to stake in the field.</li><li>Produced weekly reconciliations of surface surveys, comparing expected vs actual waste and ore movement.</li><li>Collaborated with operations and geology to provide weekly KPIs on mine productivity and material movement.</li><li>Obtained Level 2 qualification as a simulator instructor.</li>', skills: ['Mine Design', 'Survey Reconciliations', 'KPI Reporting', 'Simulator Instruction'] },
    { year: '2021', title: 'Mobile Maintenance Planner', bullets: '<li>Oct 2021 - Feb 2022: Transitioned to Mobile Maintenance Planner.</li><li>Planned weekly maintenance schedules for a mixed Komatsu and CAT fleet (haul trucks, graders, dozers, excavators, skid steers, loaders, screeners, LDVs, pumps, generators) to minimize downtime.</li><li>Staged filters, parts, and documentation for crews based on maintenance type and additional work orders raised across site.</li><li>Printed and organized maintenance SOPs and work orders from the CMMS to support safe, efficient execution.</li><li>Produced weekly KPIs on fleet availability, utilization, and maintenance backlog to support decision making.</li>', skills: ['Maintenance Planning', 'CMMS', 'Fleet Management', 'SOP Organization'] },
    
    // 2022
    { year: '2022', title: 'Company Receivership', bullets: '<li>Feb 2022: Concluded role as Mobile Maintenance Planner when the company went into receivership.</li>', skills: ['Adaptability', 'Transition Management'] },

    // 2024
    { year: '2024', title: 'EtchCentric Creations', bullets: '<li>May - Dec 2024: Started and operated EtchCentric Creations.</li>', skills: ['Entrepreneurship', 'Laser Engraving', 'Business Operations', 'Product Design'] },
    { year: '2024', title: 'IT Technician', bullets: '<li>Jul 2024 - Nov 2024: IT Technician at Canada Fluorspar Inc.</li><li>Became the "map the mess" person by physically tracing and documenting network connections to produce the first up-to-date network diagram.</li><li>Handled day-to-day end user support, from printer and scanner problems to line-of-business applications and hardware issues.</li><li>Coordinated with external IT providers to keep the environment stable during a period of change and handover.</li><li>Assisted with onboarding/offboarding, equipment allocation, and inventory across departments.</li>', skills: ['Network Mapping', 'End User Support', 'Vendor Coordination', 'IT Asset Management'] },

    // 2025
    { year: '2025', title: 'IT Coordinator', bullets: '<li>Nov 2024 - Nov 2025: IT Coordinator at Canada Fluorspar Inc.</li><li>Led site-wide IT operations for ~60 endpoints and 8 servers (AD/Entra ID hybrid, ERP RDSH, management and SQL workloads) across a remote mining site.</li><li>Rebuilt the vendor landscape: exited an underperforming MSP, onboarded a stronger local MSP, selected a new LMS platform, and found an appropriate cloud solution for our ERP.</li><li>Designed a white-box server solution instead of a major OEM stack, tailored to our remote location and service realities, balancing performance, cost, and maintainability.</li><li>Upgraded perimeter security by moving to Palo Alto firewalls and tightening network segmentation and remote access.</li><li>Implemented Motive (GoMotive) AI dashcams end-to-end.</li><li>Built automation on top of Microsoft 365, including SharePoint + Power Automate ticketing and purchasing workflows.</li><li>Developed CSV processing pipelines using Python, pandas, and PowerShell to turn daily swipe logs into usable reports.</li><li>Created Group Policy rules to silently deploy endpoint security and remote support tools.</li><li>Troubleshot and fixed legacy scan-to-email and forwarding issues.</li><li>Drafted a full IT policy suite from scratch using best practices.</li><li>Played a key role in cybersecurity recovery efforts after an Akira ransomware incident (April 2025).</li>', skills: ['IT Operations Management', 'Vendor Management', 'White-box Server Design', 'Cybersecurity & Firewalls', 'M365 Automation', 'PowerShell / Python', 'Ransomware Recovery', 'IT Policy Drafting'] },
    { year: '2025', title: 'Independent Consultant', bullets: '<li>Oct 2025 - Present: Independent Consultant.</li><li>My consulting practice focuses on helping small teams untangle messy workflows and build infrastructure they actually understand and can support.</li><li>Work with owners and operators to map how work really gets done, then design decision-gate flowcharts, responsibilities, and documentation that match reality.</li><li>Help leadership choose KPIs and reporting that reflect what is actually happening instead of pushing people to game the numbers.</li><li>Design and implement lightweight stacks using tools like Microsoft 365, SharePoint, Power Automate, Proxmox, Nextcloud, Jellyfin, Tailscale, and Cloudflare Tunnels.</li><li>Provide guidance on homelab and small-business infrastructure, including custom PC and server builds that balance performance, reliability, and supportability.</li><li>Recent work includes diagnosing and documenting wireless network issues at a remote resort (Kilmory) and recommending practical upgrades instead of "rip and replace".</li><li>Registering domains, configuring DNS, and building small business sites with custom HTML/CSS and graphics to match each brand.</li>', skills: ['Workflow Mapping', 'Process Design', 'Honest KPI Development', 'Lightweight Infrastructure', 'Proxmox & Homelabs', 'Network Diagnostics', 'Web Design'] }
];

// Generate skill to years mapping
const skillToYears = {};
nodes.forEach(node => {
    node.skills.forEach(skill => {
        if (!skillToYears[skill]) skillToYears[skill] = [];
        skillToYears[skill].push({ year: node.year, title: node.title });
    });
});

// Aggregate lifetime skills
const lifetimeSkillsSet = new Set();
nodes.forEach(node => {
    node.skills.forEach(skill => lifetimeSkillsSet.add(skill));
});
const lifetimeSkills = Array.from(lifetimeSkillsSet);

nodes.push({
    year: 'Lifetime',
    title: 'Lifetime Skills & Experience Collection',
    bullets: `<li><strong>All-Encompassing Toolkit:</strong> An aggregation of every technical capability, soft skill, and professional trait developed across my entire journey.</li>`,
    skills: lifetimeSkills
});

// Group by year
const groupedByYear = [];
let currentYear = null;
let currentGroup = null;

nodes.forEach(node => {
    if (node.year !== currentYear) {
        currentYear = node.year;
        currentGroup = { year: node.year, entries: [] };
        groupedByYear.push(currentGroup);
    }
    currentGroup.entries.push(node);
});

let sliderHtml = `
        <div class="timeline-slider-container" id="timeline-slider">
            <div class="timeline-track" id="timeline-track">
`;

groupedByYear.forEach((group, index) => {
    sliderHtml += `                <div class="timeline-tick ${index === groupedByYear.length - 1 ? 'active' : ''}" data-year="${group.year}" data-index="${index}">
                    <span class="tick-year">${group.year}</span>
                    <div class="tick-dot"></div>
                </div>\n`;
});

sliderHtml += `            </div>
        </div>

        <div class="timeline-display-container">
`;

groupedByYear.forEach((group, index) => {
    
    let innerHtml = '';
    
    group.entries.forEach((entry, entryIdx) => {
        const badgesHtml = entry.skills.map(skill => `<span class="skill-badge" title="Click to view history for ${skill}">${skill}</span>`).join('');
        const concludingBullet = `<li><strong>Skills Honed:</strong> ${entry.skills.join(', ')}</li>`;
        const finalBullets = entry.bullets + concludingBullet;
        
        // Add a divider if it's not the last entry in the group
        const divider = entryIdx < group.entries.length - 1 ? '<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 2rem 0;" />' : '';

        innerHtml += `
                <div class="role-entry">
                    <div class="role-header-wrapper">
                        <h3 class="role-title">${entry.title}</h3>
                    </div>
                    <div class="skills-container">
                        <div class="skills-label">Skills acquired or honed:</div>
                        <div class="skills-badges">${badgesHtml}</div>
                    </div>
                    <ul class="role-bullets">
                        ${finalBullets}
                    </ul>
                </div>
                ${divider}
        `;
    });

    sliderHtml += `            <div class="timeline-content-panel glass-panel ${index === groupedByYear.length - 1 ? 'active' : ''}" id="panel-${index}">
                <div class="panel-year-header" style="font-size: 1.5rem; font-weight: bold; color: var(--accent-color); margin-bottom: 1.5rem; border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem; display: inline-block;">${group.year}</div>
                ${innerHtml}
            </div>\n`;
});

sliderHtml += `        </div>
        
        <!-- Skill Side Panel UI -->
        <div class="side-panel-overlay" id="skill-overlay"></div>
        <div class="skills-side-panel glass-panel" id="skill-side-panel">
            <div class="side-panel-header">
                <h3 id="side-panel-skill-title">Skill Name</h3>
                <button id="close-side-panel">&times;</button>
            </div>
            <div class="side-panel-content" id="side-panel-content">
                <!-- Links injected via JS -->
            </div>
        </div>
        
        <script>
        document.addEventListener('DOMContentLoaded', () => {
            const skillData = ${JSON.stringify(skillToYears)};
            const badges = document.querySelectorAll('.skill-badge');
            const overlay = document.getElementById('skill-overlay');
            const panel = document.getElementById('skill-side-panel');
            const title = document.getElementById('side-panel-skill-title');
            const content = document.getElementById('side-panel-content');
            const closeBtn = document.getElementById('close-side-panel');

            const closePanel = () => {
                panel.classList.remove('open');
                overlay.classList.remove('open');
            };

            closeBtn.addEventListener('click', closePanel);
            overlay.addEventListener('click', closePanel);

            badges.forEach(badge => {
                badge.addEventListener('click', () => {
                    const skill = badge.innerText.trim();
                    if(!skillData[skill]) return;
                    
                    title.innerText = skill;
                    content.innerHTML = '';
                    
                    skillData[skill].forEach(entry => {
                        const item = document.createElement('div');
                        item.className = 'skill-timeline-link';
                        item.innerHTML = '<span class="link-year">' + entry.year + '</span><span class="link-title">' + entry.title + '</span>';
                        
                        item.addEventListener('click', () => {
                            closePanel();
                            const tick = document.querySelector('.timeline-tick[data-year="' + entry.year + '"]');
                            if(tick) {
                                tick.click();
                                setTimeout(() => {
                                    document.getElementById('timeline-slider').scrollIntoView({behavior: 'smooth', block: 'center'});
                                }, 100);
                            }
                        });
                        content.appendChild(item);
                    });
                    
                    panel.classList.add('open');
                    overlay.classList.add('open');
                });
            });
        });
        </script>
`;

const sliderStartTag = `<div class="timeline-slider-container" id="timeline-slider">`;
const styleStartTag = `<style>`;

const sliderStart = html.indexOf(sliderStartTag);
const styleStart = html.indexOf(styleStartTag);

if(sliderStart !== -1 && styleStart !== -1) {
    let finalHtml = html.substring(0, sliderStart) + sliderHtml + "\n\n" + html.substring(styleStart);
    
    // Inject CSS for the new side panel
    if (!finalHtml.includes('.skills-side-panel')) {
        const cssToAdd = `
.skill-badge {
    cursor: pointer;
    transition: all 0.2s ease;
}
.skill-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
}

.side-panel-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 9998;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}
.side-panel-overlay.open {
    opacity: 1;
    pointer-events: all;
}

.skills-side-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    max-width: 90vw;
    height: 100vh;
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    display: flex;
    flex-direction: column;
    padding: 0;
    border-radius: 0;
    border-right: none;
    border-top: none;
    border-bottom: none;
}
.skills-side-panel.open {
    transform: translateX(0);
}

.side-panel-header {
    padding: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.side-panel-header h3 {
    margin: 0;
    color: var(--accent-color);
}
.side-panel-header button {
    background: none;
    border: none;
    color: var(--text-main);
    font-size: 2.5rem;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s ease;
}
.side-panel-header button:hover {
    color: var(--accent-color);
}

.side-panel-content {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
}

.skill-timeline-link {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 1.2rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
}
.skill-timeline-link:hover {
    background: rgba(var(--accent-rgb), 0.1);
    border-color: var(--accent-color);
    transform: translateX(-4px);
}
.skill-timeline-link .link-year {
    font-weight: bold;
    color: var(--accent-color);
    font-size: 0.95rem;
    margin-bottom: 0.35rem;
}
.skill-timeline-link .link-title {
    color: var(--text-main);
    font-size: 1.1rem;
}
`;
        finalHtml = finalHtml.replace('<style>', '<style>\n' + cssToAdd);
    }

    fs.writeFileSync(path, finalHtml);
    console.log("Updated resume.html with interactive skills side panel!");
} else {
    console.error("Could not find boundaries.");
}
