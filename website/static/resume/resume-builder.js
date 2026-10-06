// resume-builder.js — handles all Resume Builder modal logic
// Loaded after the main resume page script that sets window.skillData

(function() {

// Professional descriptions keyed by role title
var roleDescriptions = {
  'IT Coordinator': {
    org: 'Current Employer — St. John\'s, NL',
    bullets: [
      'Managed IT operations for 60 users across 72 endpoints (laptops, servers, and utility machines) in a multi-site organization.',
      'Designed and deployed white-box server infrastructure with Proxmox virtualization, saving nearly 50% on hardware ($42,000 parts vs $80,000 equivalent), and eliminated extortionate MSP hardware markups (saving ~$500/laptop) and setup fees (~$5,000) by bringing procurement and provisioning in-house.',
      'Led ransomware recovery effort following an Akira incident, capturing forensic images and strategically restoring 1 laptop per department to maintain critical operations while \'offline\'. Achieved full operational recovery of 60 endpoints and 5 servers within 10 days.',
      'Engineered M365 automation with PowerShell to standardize and centralize onboarding, licensing, and compliance reporting despite limited cross-departmental data availability.',
      'Authored IT security policies, firewall rulesets, and cybersecurity procedures adopted organization-wide.'
    ]
  },
  'Independent Consultant': {
    org: 'Self-Employed — Remote',
    bullets: [
      'Provide lightweight IT infrastructure design and workflow consulting to a dedicated small business client.',
      'Build Proxmox homelabs and network diagnostics environments requiring low-cost, high-reliability setups.',
      'Deliver honest KPI frameworks and process documentation to help measure what actually matters.',
      'Develop web solutions including custom static sites with automated build pipelines and SEO optimization.'
    ]
  },
  'EtchCentric Creations': {
    org: 'Founder & Operator — St. John\'s, NL',
    bullets: [
      'Founded a custom laser engraving business offering personalized coasters, bottle openers, and bespoke items.',
      'Manage all aspects of operations: client intake, design, production scheduling, quality assurance, and delivery.',
      'Design original artwork and adapt client-supplied graphics for laser engraving across multiple materials.',
      'Operate and maintain xTool laser engraving equipment; continuously refine settings for quality and consistency.'
    ]
  },
  'IT Technician': {
    org: 'IT Department — St. John\'s, NL',
    bullets: [
      'Provided end-user support, network mapping, and hardware deployment across multiple office locations.',
      'Coordinated with vendors for procurement, warranty resolution, and service escalations.',
      'Maintained IT asset inventory and contributed to network documentation and topology diagrams.'
    ]
  },
  'Junior Mining Engineer': {
    org: 'Mining Operation — Newfoundland',
    bullets: [
      'Assisted with mine design, drill-blast planning, and survey reconciliation for an underground mining operation.',
      'Compiled and reported operational KPIs to senior engineering staff; identified production bottlenecks.',
      'Provided equipment simulator instruction to newly onboarded equipment operators.'
    ]
  },
  'Mobile Maintenance Planner': {
    org: 'Mining Operation — Newfoundland',
    bullets: [
      'Planned and scheduled preventive and corrective maintenance for a fleet of 50+ heavy mobile mining machines (haul trucks, excavators, loaders, dozers).',
      'Managed work orders through CMMS; coordinated with maintenance crews and parts procurement teams.',
      'Organized and maintained SOPs for equipment servicing to improve technician efficiency and uptime.'
    ]
  },
  'Junior Project Engineer': {
    org: 'Engineering Firm — Newfoundland',
    bullets: [
      'Supported project planning, cost tracking, and scheduling on multi-million dollar civil infrastructure projects.',
      'Coordinated with subcontractors and site supervisors to resolve field issues and mitigate schedule risks.',
      'Prepared progress reports, RFIs, and contract documentation for project managers and clients.'
    ]
  },
  'QA/QC Civil Inspector': {
    org: 'QA/QC Division — Newfoundland',
    bullets: [
      'Conducted independent quality inspections on civil construction projects, including a $10M+ tailings management facility.',
      'Performed materials testing (compaction, concrete, asphalt) and maintained detailed inspection records.',
      'Ensured regulatory compliance with environmental and safety standards throughout project execution.',
      'Issued punch lists and non-conformance reports; tracked corrective actions through to closure.'
    ]
  },
  'Student Project Engineer (Pennecon)': {
    org: 'Pennecon Ltd. — St. John\'s, NL',
    bullets: [
      'Gained hands-on experience in civil construction project coordination on active commercial job sites.',
      'Assisted with site coordination, documentation, and safety compliance monitoring.',
      'Supported engineering staff with quantity take-offs, material tracking, and daily field reporting.'
    ]
  },
  'Student Project Engineer': {
    org: 'Memorial University — St. John\'s, NL',
    bullets: [
      'Led a student engineering project involving CAD design, 3D printing, and mechanical prototype fabrication.',
      'Coordinated client requirements into functional mechanical designs and managed project milestones to deadline.',
      'Presented final prototype and technical documentation to faculty evaluators.'
    ]
  },
  'Network Technician': {
    org: 'Telecom Provider — Newfoundland',
    bullets: [
      'Provided field support for residential and commercial POTS and broadband installations and fault resolution.',
      'Managed up to 8 daily field service tickets through the internal console, consistently resolving all jobs same-day to maintain 100% SLA compliance.',
      'Diagnosed line faults, modem issues, and network configuration errors remotely and on-site.'
    ]
  },
  'University Graduate': {
    org: 'Memorial University of Newfoundland — B.Eng. Mechanical Engineering',
    bullets: [
      'Completed a Bachelor of Engineering in Mechanical Engineering, including co-op work terms.',
      'Coursework covered thermodynamics, fluid mechanics, structural analysis, materials science, and engineering design.',
      'Developed strong analytical and complex problem-solving skills through rigorous technical curriculum.'
    ]
  },
  'Air Cadets Band Senior': {
    org: 'Royal Canadian Air Cadet Corps',
    bullets: [
      'Served as a senior musician and section leader within the air cadet band program.',
      'Mentored junior cadets in musical technique, drill formations, and cadet standards of conduct.',
      'Demonstrated loyalty, leadership, and long-term commitment through years of volunteer service.'
    ]
  },
  'Air Cadets': {
    org: 'Royal Canadian Air Cadet Corps',
    bullets: [
      'Developed discipline, leadership, and teamwork through a structured military-style youth program.',
      'Studied chain of command, aviation theory, and civic responsibility as part of the cadet curriculum.'
    ]
  },
  'Private Pilot': {
    org: 'Transport Canada — Private Pilot Licence (Fixed Wing)',
    bullets: [
      'Obtained Transport Canada Private Pilot Licence for fixed-wing aircraft.',
      'Demonstrated regulatory compliance, risk management, and sound aeronautical decision-making.',
      'Completed solo cross-country navigation, instrument appreciation, and emergency procedures training.'
    ]
  },
  'Glider Pilot': {
    org: 'Air Cadets Scholarship Program',
    bullets: [
      'Earned solo glider endorsement through the highly competitive air cadet scholarship program.',
      'Developed spatial awareness, calm crisis management, and focused situational decision-making in flight.'
    ]
  },
  'Aircraft Maintenance Engineering Course': {
    org: 'Aviation Training Program',
    bullets: [
      'Completed foundational coursework in aircraft systems, avionics, and hands-on maintenance procedures.',
      'Introduced to regulatory frameworks governing aviation maintenance and technical documentation standards.'
    ]
  },
  'Lego Robotics Senior Year': {
    org: 'Regional FIRST LEGO League Competition',
    bullets: [
      'Led the senior team in a regional FIRST LEGO League competition; served as team captain and mentor.',
      'Oversaw full project execution from design conception through competition day presentation.'
    ]
  },
  'Lego Robotics': {
    org: 'Regional FIRST LEGO League Competition',
    bullets: [
      'Participated in competitive robotics team; programmed autonomous robot behaviors in NXT-G.',
      'Applied logical programming and teamwork to solve engineering design challenges under time pressure.'
    ]
  }
};

function openResumeBuilder() {
  var overlay = document.getElementById('resume-builder-overlay');
  overlay.style.display = 'flex';
  document.getElementById('rb-step-select').style.display = 'block';
  document.getElementById('rb-step-1-footer').style.display = 'flex';
  document.getElementById('rb-output-section').style.display = 'none';
  var grid = document.getElementById('rb-skill-grid');
  grid.innerHTML = '';
  
  var visibleRoles = Array.from(document.querySelectorAll('.role-entry'))
    .map(el => el.querySelector('.role-title').innerText.trim());
    
  var allSkills = Object.keys(window.skillData).filter(skill => {
    return window.skillData[skill].some(role => visibleRoles.includes(role.title));
  }).sort();

  allSkills.forEach(function(skill) {
    var chip = document.createElement('button');
    chip.className = 'rb-chip';
    chip.textContent = skill;
    chip.dataset.skill = skill;
    chip.addEventListener('click', function() { rbToggleSkill(chip); });
    grid.appendChild(chip);
  });
  rbUpdateCount();
}

function closeResumeBuilder() {
  document.getElementById('resume-builder-overlay').style.display = 'none';
}

function rbBack() {
  document.getElementById('rb-step-select').style.display = 'block';
  document.getElementById('rb-step-1-footer').style.display = 'flex';
  document.getElementById('rb-output-section').style.display = 'none';
}

function rbToggleSkill(chip) {
  chip.classList.toggle('rb-selected');
  rbUpdateCount();
}

function rbUpdateCount() {
  var count = document.querySelectorAll('.rb-chip.rb-selected').length;
  document.getElementById('rb-selected-count').textContent = count + ' skill' + (count !== 1 ? 's' : '') + ' selected';
}

function rbClearAll() {
  document.querySelectorAll('.rb-chip.rb-selected').forEach(function(c) { c.classList.remove('rb-selected'); });
  rbUpdateCount();
  document.getElementById('rb-output-section').style.display = 'none';
}

function rbGenerate() {
  var selectedNodes = Array.from(document.querySelectorAll('.rb-chip.rb-selected'));
  var selected = selectedNodes.length > 0 ? selectedNodes.map(function(c) { return c.dataset.skill; }) : (window._rbSelectedSkills || []);
  if (selectedNodes.length > 0) {
      window._rbSelectedSkills = selected;
  }
  if (selected.length < 1) { alert('Please select at least one skill.'); return; }

  // Build role map
  var relevantRoles = {};
  selected.forEach(function(skill) {
    (window.skillData[skill] || []).forEach(function(entry) {
      if (!relevantRoles[entry.title]) relevantRoles[entry.title] = { title: entry.title, year: entry.year, skills: [] };
      if (!relevantRoles[entry.title].skills.includes(skill)) relevantRoles[entry.title].skills.push(skill);
    });
  });

  var professionalRoles = Array.from(document.querySelectorAll('.role-entry'))
    .map(el => el.querySelector('.role-title').innerText.trim());

  // Only professional roles that have a professional description
  var sortedRoles = Object.values(relevantRoles)
    .filter(function(r) { return roleDescriptions[r.title] && professionalRoles.includes(r.title); })
    .sort(function(a, b) { return parseInt(b.year) - parseInt(a.year); })
    .slice(0, 9);

  // Core competency chips
  var chipsHtml = selected.map(function(s) {
    return '<span style="display:inline-block;background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(6,182,212,0.15));border:1px solid rgba(124,58,237,0.5);color:#c4b5fd;padding:0.3rem 0.75rem;border-radius:20px;font-size:0.8rem;font-weight:600;margin:0.2rem;">' + s + '</span>';
  }).join('');

  // Experience rows
  var expHtml = sortedRoles.map(function(role) {
    var desc = roleDescriptions[role.title];
    var skillPills = role.skills.map(function(s) {
      return '<span style="display:inline-block;background:linear-gradient(135deg,rgba(124,58,237,0.18),rgba(6,182,212,0.1));border:1px solid rgba(124,58,237,0.4);color:#c4b5fd;padding:0.15rem 0.55rem;border-radius:12px;font-size:0.72rem;font-weight:600;margin:0.15rem;">' + s + '</span>';
    }).join('');
    var bulletsHtml = desc.bullets.map(function(b) {
      return '<li style="margin-bottom:0.38rem;color:#94a3b8;font-size:0.85rem;line-height:1.55;">' + b + '</li>';
    }).join('');

    return '<div style="padding:1.1rem 0;border-bottom:1px solid rgba(255,255,255,0.055);">' +
      '<div style="display:flex;gap:0.9rem;align-items:flex-start;margin-bottom:0.5rem;flex-wrap:wrap;">' +
        '<div style="flex-shrink:0;padding-top:0.15rem;">' +
          '<span style="font-size:0.7rem;color:#7c3aed;font-weight:700;font-family:monospace;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);border-radius:6px;padding:0.15rem 0.45rem;">' + role.year + '</span>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:0.97rem;font-weight:700;color:#e2e8f0;line-height:1.2;">' + role.title + '</div>' +
          '<div style="font-size:0.78rem;color:#64748b;margin-top:0.18rem;font-style:italic;">' + desc.org + '</div>' +
        '</div>' +
      '</div>' +
      '<ul style="margin:0 0 0.55rem 3.4rem;padding:0;list-style:disc;">' + bulletsHtml + '</ul>' +
      '<div style="margin-left:3.4rem;display:flex;flex-wrap:wrap;">' + skillPills + '</div>' +
    '</div>';
  }).join('');

  var printChips = selected.join(', ');

  var printExpHtml = sortedRoles.map(function(role) {
    var desc = roleDescriptions[role.title];
    var bulletsHtml = desc.bullets.map(function(b) {
      return '<li style="margin-bottom:0.35rem;">' + b + '</li>';
    }).join('');
    
    return '<div style="margin-bottom:1.25rem; display:block; position:relative; page-break-inside:avoid; break-inside:avoid;">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;">' +
        '<div style="font-size:1.05rem;font-weight:700;">' + role.title + '</div>' +
        '<div style="font-size:0.95rem;font-weight:600;">' + role.year + '</div>' +
      '</div>' +
      '<div style="font-size:0.95rem;font-style:italic;margin-bottom:0.4rem;color:#333;">' + desc.org + '</div>' +
      '<ul style="margin:0;padding-left:1.25rem;font-size:0.95rem;line-height:1.45;color:#111;">' + bulletsHtml + '</ul>' +
    '</div>';
  }).join('');

  window._rbPrintHtml =
    '<div style="width:100%; max-width:850px; margin:0 auto; padding: 0 1in; box-sizing:border-box; font-family:\'Inter\',sans-serif; color:#000;">' +
      '<div style="text-align:center;border-bottom:1.5px solid #000;padding-bottom:1rem;margin-bottom:1.5rem;">' +
        '<h1 style="margin:0;font-size:2.4rem;font-weight:800;letter-spacing:-0.03em;">Jonathan Thoms</h1>' +
        '<p style="margin:0.5rem 0 0;font-size:0.95rem;color:#444;">thomsfoolery.com/resume/ &nbsp;|&nbsp; Lewin\'s Cove, NL &nbsp;|&nbsp; B.Eng. Mechanical Engineering (2016)</p>' +
      '</div>' +
      '<div style="margin-bottom:1.5rem;">' +
        '<div style="font-size:1.1rem;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;margin-bottom:0.6rem;padding-bottom:0.2rem;letter-spacing:0.05em;">Core Competencies</div>' +
        '<div style="font-size:0.95rem;line-height:1.6;color:#222;">' + printChips + '</div>' +
      '</div>' +
      (sortedRoles.length > 0 ?
        '<div>' +
          '<div style="font-size:1.1rem;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ddd;margin-bottom:1rem;padding-bottom:0.2rem;letter-spacing:0.05em;">Professional Experience</div>' +
          printExpHtml +
        '</div>'
      : '') +
    '</div>';

  var cardHtml =
    '<div style="background:linear-gradient(160deg,#0d1220,#141927);padding:2rem;font-family:Outfit,sans-serif;">' +
      // Header
      '<div style="border-bottom:1px solid rgba(124,58,237,0.3);padding-bottom:1.4rem;margin-bottom:2.5rem;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;">' +
          '<div>' +
            '<h1 style="margin:0;font-size:1.75rem;font-weight:800;color:#f1f5f9;letter-spacing:-0.02em;">Jonathan Thoms</h1>' +
            '<p style="margin:0.35rem 0 0;font-size:0.83rem;color:#64748b;">thomsfoolery.com/resume/ &nbsp;·&nbsp; Lewin\'s Cove, NL &nbsp;·&nbsp; B.Eng. Mechanical Engineering (2016)</p>' +
          '</div>' +
          '<div style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1));border:1px solid rgba(124,58,237,0.35);border-radius:8px;padding:0.4rem 0.9rem;font-size:0.73rem;color:#a78bfa;font-weight:600;white-space:nowrap;align-self:flex-start;">' +
            '📄 Tailored · ' + selected.length + ' matched skills' +
          '</div>' +
        '</div>' +
      '</div>' +
      // Core Competencies
      '<div style="margin-bottom:1.75rem;">' +
        '<div style="font-size:0.67rem;font-weight:800;letter-spacing:0.14em;color:#7c3aed;text-transform:uppercase;margin-bottom:0.65rem;border-left:3px solid #7c3aed;padding-left:0.6rem;">Core Competencies</div>' +
        '<div style="display:flex;flex-wrap:wrap;">' + chipsHtml + '</div>' +
      '</div>' +
      // Relevant Experience
      (sortedRoles.length > 0 ?
        '<div>' +
          '<div style="font-size:0.67rem;font-weight:800;letter-spacing:0.14em;color:#7c3aed;text-transform:uppercase;margin-bottom:0.25rem;border-left:3px solid #7c3aed;padding-left:0.6rem;">Relevant Experience</div>' +
          expHtml +
        '</div>'
      : '<p style="color:#64748b;font-size:0.85rem;margin-top:1rem;">No professional roles matched the selected skills. Try selecting skills like IT Operations Management, Project Management, or Entrepreneurship.</p>') +
      // Footer
      '<div style="margin-top:1.5rem;padding-top:0.9rem;border-top:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">' +
        '<span style="font-size:0.7rem;color:#334155;">Generated by Thoms Foolery Resume Builder</span>' +
        '<span style="font-size:0.7rem;color:#334155;">' + new Date().toLocaleDateString('en-CA', {year:'numeric', month:'long', day:'numeric'}) + '</span>' +
      '</div>' +
    '</div>';

  document.getElementById('rb-resume-card').innerHTML = cardHtml;
  document.getElementById('rb-step-select').style.display = 'none';
  document.getElementById('rb-step-1-footer').style.display = 'none';
  document.getElementById('rb-output-section').style.display = 'block';
  document.getElementById('resume-builder-overlay').scrollTop = 0;
}

function rbPrint() {
  var printContent = window._rbPrintHtml || document.getElementById('rb-resume-card').innerHTML;
  var win = window.open('', '_blank');
  win.document.write(
    '<!DOCTYPE html><html><head><title>Resume — Jonathan Thoms</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">' +
    '<style>' +
    '*{box-sizing:border-box;} ' +
    'body{margin:0;background:#fff;} ' +
    '@page{margin:0;} ' +
    '@media print { ' +
      'body { counter-reset: page; } ' +
      '.page-number::after { counter-increment: page; content: "Page " counter(page); } ' +
    '} ' +
    '</style>' +
    '</head><body>' +
    '<table style="width:100%; border-spacing:0; margin:0;">' +
      '<thead style="height:1.25in; display:table-header-group;">' +
        '<tr><td><div style="height:1.25in;"></div></td></tr>' +
      '</thead>' +
      '<tfoot style="height:1.25in; display:table-footer-group;">' +
        '<tr><td style="vertical-align:bottom; padding-right:1in; padding-bottom:0.6in; text-align:right; font-family:\'Inter\',sans-serif; font-size:0.75rem; color:#666; font-weight:600;">' +
          '<div class="page-number"></div>' +
        '</td></tr>' +
      '</tfoot>' +
      '<tbody>' +
        '<tr><td style="padding:0;">' +
          printContent +
        '</td></tr>' +
      '</tbody>' +
    '</table>' +
    '</body></html>'
  );
  win.document.close();
  setTimeout(function() { win.print(); }, 600);
}

function rbCopyLink() {
  var url = window.location.origin + '/resume/';
  if (window._rbSelectedSkills && window._rbSelectedSkills.length > 0) {
      var params = new URLSearchParams();
      params.set('skills', window._rbSelectedSkills.map(encodeURIComponent).join(','));
      url += '?' + params.toString();
  }
  navigator.clipboard.writeText(url).then(function() {
    var btn = document.querySelector('[onclick="rbCopyLink()"]');
    if (btn) {
      btn.textContent = '✅ Copied!';
      setTimeout(function() { btn.textContent = '🔗 Copy Resume URL'; }, 1800);
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  var params = new URLSearchParams(window.location.search);
  var skillsParam = params.get('skills');
  if (skillsParam) {
      var skillsList = skillsParam.split(',').map(decodeURIComponent);
      window._rbSelectedSkills = skillsList;
      openResumeBuilder();
      setTimeout(function() {
          var chips = document.querySelectorAll('.rb-chip');
          chips.forEach(function(c) {
              if (skillsList.includes(c.dataset.skill)) {
                  c.classList.add('rb-selected');
              }
          });
          rbUpdateCount();
          rbGenerate();
      }, 100);
  }
});

// Expose to global scope
window.openResumeBuilder = openResumeBuilder;
window.closeResumeBuilder = closeResumeBuilder;
window.rbBack = rbBack;
window.rbToggleSkill = rbToggleSkill;
window.rbClearAll = rbClearAll;
window.rbGenerate = rbGenerate;
window.rbPrint = rbPrint;
window.rbCopyLink = rbCopyLink;

})();
