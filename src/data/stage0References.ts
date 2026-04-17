export interface SOPRef {
  id: string;
  title: string;
  category: string;
  stage: string;
  rec: string;
  finding: string;
  whenFollowed: string;
  whenNotFollowed: string;
  procedure: string[];
  tools: string[];
  outputs: string[];
  faq: { q: string; a: string }[];
  crossReferences: string[];
}

export interface FindingRef {
  id: string;
  title: string;
  what: string;
  why: string;
  rootCause: string;
  linkedRec: string;
  linkedSOPs: string[];
}

export interface RecRef {
  id: string;
  number: string;
  title: string;
  description: string;
  implementationDetails: string[];
  minimumArtifacts: string[];
}

export interface EightWaste {
  name: string;
  definition: string;
}

export const SOPS: Record<string, SOPRef> = {
  'SOP-01': {
    id: 'SOP-01',
    title: '5S and Visual Management',
    category: 'Visual Factory',
    stage: 'Stage 0',
    rec: '4.0',
    finding: 'F',
    whenFollowed: 'The plant is a safe, clear, and motivating place to work. Anyone can see \'what goes where\' and \'what work is due today\' in under 60 seconds, enabling faster flow, fewer mistakes, safer work, easier training, and higher ownership.',
    whenNotFollowed: 'The plant becomes disorganized, unsafe, and inefficient. Time is wasted searching for tools and materials, mistakes increase, and training new employees becomes difficult.',
    procedure: [
      'Start: The plant manager initiates a 5S blitz in a specific zone.',
      'Sort (Seiri): Go through all items in the work area. Separate necessary from unnecessary items. Red-tag unnecessary items for removal, relocation, or scrap.',
      'Set in Order (Seiton): Designate a specific location for every necessary item. Use floor markings, shadow boards, and labels to make locations clear. Store items at the point of use where possible.',
      'Shine (Seiso): Thoroughly clean the work area. Perform basic maintenance checks on equipment. Identify and address sources of dirt and contamination.',
      'Standardize (Seiketsu): Create standard procedures for maintaining the first three S\'s. Use photos to document the standard state. Establish replenishment rules for consumables.',
      'Sustain (Shitsuke): Conduct weekly 5S audits with a checklist and scoring. Post audit results and create action plans for low-scoring areas. Incorporate 5S into daily work and the daily huddle.',
      'Stop: The 5S audit for the zone achieves a score of 90% or higher for two consecutive weeks.',
    ],
    tools: [
      'Red tags',
      'Cleaning supplies',
      'Label maker',
      'Floor marking tape',
      'Shadow board materials',
      '5S audit checklist',
    ],
    outputs: [
      'A clean, organized, and visually controlled work area',
      'A red-tag disposition list',
      'Marked locations for all items',
      'Shadow boards and labeled storage',
      'Area production boards with daily plans',
      'Completed 5S audit checklists',
    ],
    faq: [
      {
        q: 'Who is responsible for 5S?',
        a: 'Everyone is responsible for maintaining 5S in their work area. The plant manager leads implementation and audits.',
      },
      {
        q: 'How often should we do 5S?',
        a: 'Sort, Set in Order, and Shine are performed during the initial blitz and then continuously. Standardize and Sustain are ongoing activities.',
      },
    ],
    crossReferences: ['SOP-02', 'SOP-38'],
  },

  'SOP-02': {
    id: 'SOP-02',
    title: 'Dedicated Storage & Inventory Rules (5S reset)',
    category: 'Visual Factory',
    stage: 'Stage 0',
    rec: '4.0',
    finding: 'F, H',
    whenFollowed: 'All materials, tools, and inventory have a dedicated, labeled location. This reduces search time, prevents mix-ups, and ensures the right items are available when needed.',
    whenNotFollowed: 'Materials and inventory are disorganized, leading to wasted time, production delays, and incorrect parts being used. It is difficult to know what is in stock.',
    procedure: [
      'Start: The 5S blitz for a zone is completed (SOP-01).',
      'Define Storage Zones: Designate and clearly mark separate zones for Raw Materials, Work-in-Progress (WIP), Finished Goods, Quarantine (HOLD), and Tooling.',
      'Establish Inventory Rules: Implement a First-In, First-Out (FIFO) system. Define min-max levels for standard parts and consumables. Use a Kanban or reorder point system to trigger replenishment.',
      'Label Everything: All storage locations must be labeled. All inventory items must be clearly labeled with a part number and description. WIP and Finished Goods must be labeled with job number, part ID, and quantity.',
      'Implement Cycle Counting: Establish a regular cycle counting schedule to verify inventory accuracy. Investigate and correct any discrepancies found.',
      'Stop: The inventory accuracy rate is consistently at or above 98%.',
    ],
    tools: [
      'Label maker',
      'Floor marking tape',
      'Storage bins and shelving',
      'Inventory management system',
      'Cycle counting sheets',
    ],
    outputs: [
      'Clearly defined and labeled storage zones',
      'Established min-max levels and reorder points',
      'Accurate inventory records',
      'A consistent and reliable inventory management process',
    ],
    faq: [
      {
        q: 'Who is responsible for maintaining inventory accuracy?',
        a: 'The plant manager is ultimately responsible, but all employees who handle materials have a role in following procedures and reporting discrepancies.',
      },
      {
        q: 'What happens if I find an item without a label or in the wrong location?',
        a: 'Move the item to its correct location if you know it. If not, move it to a designated \'lost and found\' area and notify the plant manager.',
      },
    ],
    crossReferences: ['SOP-01', 'SOP-33', 'SOP-34', 'SOP-37'],
  },
};

export const FINDINGS: Record<string, FindingRef> = {
  F: {
    id: 'F',
    title: 'Finding F — The plant has no defined visual layout',
    what: 'The physical layout currently does not reinforce control. There are no consistent floor markings, no labeled zones for receiving, staging, WIP, finished goods, and HOLD. There are no simple location identifiers for pallets or staging positions.',
    why: 'Without visual controls, search time increases, re-handling increases, and the risk of mixing items across jobs increases — especially during rush periods. A disorganized floor makes it impossible to see flow. When WIP is not in a defined location, it is invisible to planning and quality control. Visual management is a prerequisite for all other improvements. You cannot enforce a release gate if the floor cannot distinguish between released and unreleased work.',
    rootCause: 'The absence of a visual factory is the physical expression of the missing execution control system.',
    linkedRec: 'Rec 4.0 — Guiding Principles',
    linkedSOPs: ['SOP-01', 'SOP-02'],
  },
};

export const RECOMMENDATIONS: Record<string, RecRef> = {
  '4.0': {
    id: '4.0',
    number: '4.0',
    title: 'Guiding Principles (Non-Negotiable)',
    description: 'Establish a small set of non-negotiable execution rules that protect flow, reduce avoidable variation, and make decision-making consistent under pressure across Site, Design, and Plant. These principles are not a \'culture change.\' They are the operating rules that the IPCS implementation depends on.',
    implementationDetails: [
      'Do not start work unless it can finish with a full kit — minimum required information, stable revision, required materials, and a clear owner.',
      'One packet and one revision controls execution. The floor does not build from email trails, verbal confirmations, or mixed sources.',
      'The plant operates on a visible daily rhythm, not the latest loudest request. Priorities are reviewed in a defined cadence.',
      'Quality control is performed at the source and contained immediately. Defects are logged, root causes reviewed on a cadence, and corrections fed back into standards.',
      'The daily huddle is a cross-cutting mechanism that evolves with the transformation — from a 10-minute safety standup in Stage 0 to a full production control standup in Stage 7.',
      'Site feedback is treated as operational input, not anecdote.',
    ],
    minimumArtifacts: [
      'Definition of \'Ready to Produce\' including controlled pre-visa scope list and signoff roles',
      'Work Order Packet (WOP) template tied to revision control and labeling standard',
      'Escalation ladder with decision thresholds and owners',
      'HOLD area definition and basic containment rules',
      'Daily huddle format and dashboard structure used by the Plant Manager',
      'Simple defect log (NCR) with minimum defect codes and review cadence',
    ],
  },
};

export const EIGHT_WASTES: EightWaste[] = [
  { name: 'Defects', definition: 'Mistakes or rework needed due to poor quality, missing information, or specification misalignment.' },
  { name: 'Overproduction', definition: 'Making more than is needed now — drives excess inventory and creates visibility waste when the floor fills with unprioritized work.' },
  { name: 'Waiting', definition: 'Idle time when materials, tools, information, or approvals are not available when needed.' },
  { name: 'Non-Utilized Talent', definition: 'Staff expertise, ideas, and capability are not fully engaged; decisions and problem-solving are centralized.' },
  { name: 'Transportation', definition: 'Unnecessary movement of materials between locations, caused by poor layout or lack of point-of-use storage.' },
  { name: 'Inventory', definition: 'Excess materials, tools, and work-in-progress that sits unused, hiding problems and consuming space.' },
  { name: 'Motion', definition: 'Unnecessary reaching, bending, walking, or searching for tools and materials due to poor layout or lack of labeling.' },
  { name: 'Extra Processing', definition: 'Work steps that add no value: re-checking, re-handling, data re-entry, or steps required only because earlier steps were not stable.' },
];
