import fs from 'fs';

const path = '/home/keel/Project-Atlas-main/website/templates/layouts/resume.html';
const html = fs.readFileSync(path, 'utf8');

const nodes = [
    { year: '1993', title: 'Born', bullets: '<li>Born in Carbonear, Newfoundland.</li>' },
    { year: '1998', title: 'Kindergarten', bullets: '<li>Started kindergarten in St. John\'s.</li>' },
    { year: '1999', title: 'Moved to Carbonear', bullets: '<li>Moved to Carbonear for Grade 1.</li>' },
    { year: '2002', title: 'Grade 4', bullets: '<li>Highest grade achieved in Grade 4 in my school.</li>' },
    
    // 2004 split
    { year: '2004', title: 'School Band', bullets: '<li>Started playing clarinet in the school band.</li>' },
    { year: '2004', title: 'Math Placement', bullets: '<li>Placed in the top 85th percentile in provincial math placement testing (highest in the school).</li>' },
    
    { year: '2005', title: 'Air Cadets', bullets: '<li>Turned 12 and joined air cadets.</li>' },
    
    // 2006 split
    { year: '2006', title: 'Lego Robotics', bullets: '<li>Joined lego robotics and went to the world competition in Atlanta, Georgia. Came 2nd in the teams relay category, matching with other teams where each team completed a portion of the track.</li>' },
    { year: '2006', title: 'Cadets Band', bullets: '<li>Joined the Air Cadets band in my second year, naturally excelling at the snare drum and performing rolls on the first day.</li>' },
    { year: '2006', title: 'Drama Club', bullets: '<li>Participated in Grade 8 Drama Club.</li>' },

    // 2007 split
    { year: '2007', title: 'Lego Robotics Senior Year', bullets: '<li>Senior year of lego robotics, once again traveled to the world competition in Atlanta, Georgia.</li>' },
    { year: '2007', title: 'Social Studies', bullets: '<li>Achieved the highest grade in social studies.</li>' },
    { year: '2007', title: 'Drama Club', bullets: '<li>Participated in Grade 9 Drama Club; won Best Actor in a Supporting Role, and the club won Best Play.</li>' },

    { year: '2009', title: 'Aircraft Maintenance Engineering Course', bullets: '<li>Completed aircraft maintenance engineering course through air cadets (6 week program).</li>' },
    { year: '2010', title: 'Glider Pilot', bullets: '<li>Obtained a glider pilot license.</li>' },
    
    // 2011 split
    { year: '2011', title: 'High School Graduate', bullets: '<li>Graduated high school with honours.</li>' },
    { year: '2011', title: 'Private Pilot', bullets: '<li>Obtained a private pilot license.</li>' },

    { year: '2012', title: 'Air Cadets Band Senior', bullets: '<li>Remained highly involved in the cadets band until age 19.</li><li>Returned to uniform at 19 to march in the November 11th parade in Carbonear to help fill key missing roles.</li>' },
    
    // 2013 split (with new details from user!)
    { year: '2013', title: 'Student Project Engineer', bullets: '<li>Jan - May 2013: Student Project Engineer for Industrial Outreach Group (a small internal student engineering company run by MUN).</li><li>Using CAD to create 3D models of designs, exported to .stl file format, and 3D printed/laser cut for clients (shampoo helper for severe arthritis, circuit board container).</li><li>Chapman\'s Bakery: Chocolate coating machine modifications to compensate for chocolate recipe using paraffin wax.</li><li>EverGreen Recycling: Designed a bottle/can crusher to reduce the volume of bottles/cans to a specific percentage to fit more product in bags while maintaining specifications for crushing limits.</li>' },
    { year: '2013', title: 'Network Technician', bullets: '<li>Sept - Dec 2013: Network Technician for Bell Aliant on a student work term.</li><li>Logging in and checking system submitted tickets submitted by technicians to perform in the morning.</li><li>Receiving calls and coordinating with the technicians out in the field.</li><li>Worked with POTS punching in corresponding terminals to provide clients with their service.</li><li>Also pulled wires when clients cancelled their service.</li>' },

    // 2014 & 2015
    { year: '2014', title: 'Student Project Engineer (Pennecon)', bullets: '<li>May - Sept 2014: First work term as a Student Project Engineer for Pennecon M&M Engineering.</li><li>Dec 2014: Began second work term for Pennecon.</li>' },
    { year: '2015', title: 'Student Project Engineer (Pennecon)', bullets: '<li>May 2015: Concluded second work term as a Student Project Engineer for Pennecon M&M Engineering.</li>' },
    
    // 2016 split
    { year: '2016', title: 'University Graduate', bullets: '<li>Graduated university with a mechanical engineering degree.</li>' },
    { year: '2016', title: 'Chill Staff (Dairy Queen)', bullets: '<li>Sept 2016 - March 2017: Joined Dairy Queen as Chill Staff.</li><li>Delivered fast, accurate, and friendly service in a busy restaurant environment while handling cash and cleaning duties.</li>' },

    // 2017 & 2019
    { year: '2017', title: 'QA/QC Civil Inspector', bullets: '<li>Jun - Sep 2017: QA/QC Civil Inspector.</li><li>Inspected civil construction work to ensure compliance with drawings, specifications, and regulatory requirements.</li><li>Prepared inspection reports and punch lists, highlighting non-conformances and opportunities for improvement.</li><li>Coordinated with supervisors and equipment operators to resolve issues while keeping safety and environmental requirements front of mind.</li><li>Performed basic materials testing and quality checks to verify workmanship.</li>' },
    { year: '2019', title: 'QA/QC Civil Inspector', bullets: '<li>Apr - Jun 2019: QA/QC Civil Inspector.</li><li>Inspected civil construction work to ensure compliance with drawings, specifications, and regulatory requirements.</li><li>Prepared inspection reports and punch lists, highlighting non-conformances and opportunities for improvement.</li><li>Coordinated with supervisors and equipment operators to resolve issues while keeping safety and environmental requirements front of mind.</li><li>Performed basic materials testing and quality checks to verify workmanship.</li>' },
    
    // 2020
    { year: '2020', title: 'Junior Project Engineer', bullets: '<li>Jun 2019 - Jan 2021: Junior Project Engineer.</li><li>Supported civil and infrastructure projects from planning through execution, including estimating, scheduling, and cost tracking.</li><li>Coordinated with contractors and vendors, ran site inspections, and kept documentation (reports, drawings, specs) up to date.</li><li>Helped identify project risks and contributed to mitigation plans.</li>' },

    // 2021 split
    { year: '2021', title: 'Junior Mining Engineer', bullets: '<li>Jan - Oct 2021: Junior Mining Engineer.</li><li>Designed mine roads and layouts and prepared drawings and files for surveyors to stake in the field.</li><li>Produced weekly reconciliations of surface surveys, comparing expected vs actual waste and ore movement.</li><li>Collaborated with operations and geology to provide weekly KPIs on mine productivity and material movement.</li><li>Obtained Level 2 qualification as a simulator instructor.</li>' },
    { year: '2021', title: 'Mobile Maintenance Planner', bullets: '<li>Oct 2021 - Feb 2022: Transitioned to Mobile Maintenance Planner.</li><li>Planned weekly maintenance schedules for a mixed Komatsu and CAT fleet (haul trucks, graders, dozers, excavators, skid steers, loaders, screeners, LDVs, pumps, generators) to minimize downtime.</li><li>Staged filters, parts, and documentation for crews based on maintenance type and additional work orders raised across site.</li><li>Printed and organized maintenance SOPs and work orders from the CMMS to support safe, efficient execution.</li><li>Produced weekly KPIs on fleet availability, utilization, and maintenance backlog to support decision making.</li>' },
    
    // 2022
    { year: '2022', title: 'Company Receivership', bullets: '<li>Feb 2022: Concluded role as Mobile Maintenance Planner when the company went into receivership.</li>' },

    // 2024 split
    { year: '2024', title: 'EtchCentric Creations', bullets: '<li>May - Dec 2024: Started and operated EtchCentric Creations.</li>' },
    { year: '2024', title: 'IT Technician', bullets: '<li>Jul 2024 - Nov 2024: IT Technician at Canada Fluorspar Inc.</li><li>Became the "map the mess" person by physically tracing and documenting network connections to produce the first up-to-date network diagram.</li><li>Handled day-to-day end user support, from printer and scanner problems to line-of-business applications and hardware issues.</li><li>Coordinated with external IT providers to keep the environment stable during a period of change and handover.</li><li>Assisted with onboarding/offboarding, equipment allocation, and inventory across departments.</li>' },

    // 2025 split
    { year: '2025', title: 'IT Coordinator', bullets: '<li>Nov 2024 - Nov 2025: IT Coordinator at Canada Fluorspar Inc.</li><li>Led site-wide IT operations for ~60 endpoints and 8 servers (AD/Entra ID hybrid, ERP RDSH, management and SQL workloads) across a remote mining site.</li><li>Rebuilt the vendor landscape: exited an underperforming MSP, onboarded a stronger local MSP, selected a new LMS platform, and found an appropriate cloud solution for our ERP.</li><li>Designed a white-box server solution instead of a major OEM stack, tailored to our remote location and service realities, balancing performance, cost, and maintainability.</li><li>Upgraded perimeter security by moving to Palo Alto firewalls and tightening network segmentation and remote access.</li><li>Implemented Motive (GoMotive) AI dashcams end-to-end.</li><li>Built automation on top of Microsoft 365, including SharePoint + Power Automate ticketing and purchasing workflows.</li><li>Developed CSV processing pipelines using Python, pandas, and PowerShell to turn daily swipe logs into usable reports.</li><li>Created Group Policy rules to silently deploy endpoint security and remote support tools.</li><li>Troubleshot and fixed legacy scan-to-email and forwarding issues.</li><li>Drafted a full IT policy suite from scratch using best practices.</li><li>Played a key role in cybersecurity recovery efforts after an Akira ransomware incident (April 2025).</li>' },
    { year: '2025', title: 'Independent Consultant', bullets: '<li>Oct 2025 - Present: Independent Consultant.</li><li>My consulting practice focuses on helping small teams untangle messy workflows and build infrastructure they actually understand and can support.</li><li>Work with owners and operators to map how work really gets done, then design decision-gate flowcharts, responsibilities, and documentation that match reality.</li><li>Help leadership choose KPIs and reporting that reflect what is actually happening instead of pushing people to game the numbers.</li><li>Design and implement lightweight stacks using tools like Microsoft 365, SharePoint, Power Automate, Proxmox, Nextcloud, Jellyfin, Tailscale, and Cloudflare Tunnels.</li><li>Provide guidance on homelab and small-business infrastructure, including custom PC and server builds that balance performance, reliability, and supportability.</li><li>Recent work includes diagnosing and documenting wireless network issues at a remote resort (Kilmory) and recommending practical upgrades instead of "rip and replace".</li><li>Registering domains, configuring DNS, and building small business sites with custom HTML/CSS and graphics to match each brand.</li>' }
];

let sliderHtml = `
        <div class="timeline-slider-container" id="timeline-slider">
            <div class="timeline-track" id="timeline-track">
`;

nodes.forEach((node, index) => {
    sliderHtml += `                <div class="timeline-tick ${index === nodes.length - 1 ? 'active' : ''}" data-year="${node.year}" data-index="${index}">
                    <span class="tick-year">${node.year}</span>
                    <div class="tick-dot"></div>
                </div>\n`;
});

sliderHtml += `            </div>
        </div>

        <div class="timeline-display-container">
`;

nodes.forEach((node, index) => {
    sliderHtml += `            <div class="timeline-content-panel glass-panel ${index === nodes.length - 1 ? 'active' : ''}" id="panel-${index}">
                <h3 class="role-title">${node.title}</h3>
                <div class="role-meta">${node.year}</div>
                <ul class="role-bullets">
                    ${node.bullets}
                </ul>
            </div>\n`;
});

sliderHtml += `        </div>`;

const sliderStartTag = `<div class="timeline-slider-container" id="timeline-slider">`;
const styleStartTag = `<style>`;

const sliderStart = html.indexOf(sliderStartTag);
const styleStart = html.indexOf(styleStartTag);

if(sliderStart !== -1 && styleStart !== -1) {
    let finalHtml = html.substring(0, sliderStart) + sliderHtml + "\n\n" + html.substring(styleStart);
    fs.writeFileSync(path, finalHtml);
    console.log("Updated resume.html with split nodes and new details!");
} else {
    console.error("Could not find boundaries.");
}
