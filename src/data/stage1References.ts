// Stage 1 references — SOPs, findings, and recommendations.
//
// The SOP bodies (title, whenFollowed, whenNotFollowed, procedure, tools,
// outputs, FAQ, cross-references) are captured verbatim from the Tracer SOP
// Library at https://tracersop-emzu5tfw.manus.space/ (SOP cards,
// expanded on 2026-04-20).
//
// The Findings and Recommendations sections are grounded in the Tracer Audit
// Report Final v43-2 (Finding D, Finding E, Rec 4.0, Rec 4.5 and the Action
// Plan Stage 1 block).

import type { SOPRef, FindingRef, RecRef } from './stage0References';

export const STAGE1_SOPS: Record<string, SOPRef> = {
  'SOP-23': {
    id: 'SOP-23',
    title: 'Priority rules and dispatch decision rights',
    category: 'Governance',
    stage: 'Stage 1',
    rec: '4.5',
    finding: 'E',
    whenFollowed:
      'Production work is prioritized consistently and transparently, based on clear rules and decision rights. This prevents confusion, reduces the need for CEO intervention, and ensures that the most important work is done first.',
    whenNotFollowed:
      'Production work is prioritized inconsistently and based on whoever shouts the loudest. This leads to confusion, resentment, and a chaotic production environment.',
    procedure: [
      'Start: The Plant Manager needs to prioritize production work.',
      'Apply the Priority Tiers: The Plant Manager applies the following priority tiers to all production work: P1 (site shutdown/penalty), P2 (committed shipment), P3 (routine/stock).',
      'Sequence Within the Frozen Window: The Plant Manager has the authority to sequence work within the frozen planning window, based on the priority tiers.',
      'Reject Unqualified Urgents: The Plant Manager has the authority to reject urgent requests that do not meet the criteria for P1 or P2 priority.',
      'Escalate to the CEO (if necessary): If a production decision requires CEO involvement (e.g., external commitments or financial impact), the Plant Manager escalates to the CEO.',
      'Stop: The production work has been prioritized and the production plan has been updated.',
    ],
    tools: [
      'Priority tier definitions and decision tree (posted in plant)',
      'Production schedule',
    ],
    outputs: [
      'A prioritized production plan',
      'Clear decision rights for the Plant Manager',
    ],
    faq: [
      {
        q: "What is the 'frozen window'?",
        a: "The 'frozen window' is the period of time during which the production schedule is locked and cannot be changed without a formal change request.",
      },
      {
        q: "What happens if I disagree with the Plant Manager's prioritization decision?",
        a: "If you disagree with the Plant Manager's decision, you should escalate the issue through the escalation ladder (SOP-24).",
      },
    ],
    crossReferences: ['SOP-24', 'SOP-25', 'SOP-26', 'SOP-27', 'SOP-39'],
  },

  'SOP-24': {
    id: 'SOP-24',
    title: "Escalation ladder and 'stop the line' criteria",
    category: 'Governance',
    stage: 'Stage 1',
    rec: '4.5',
    finding: 'E',
    whenFollowed:
      "Issues are escalated quickly and to the right person, preventing small problems from becoming big ones. The 'stop the line' criteria ensure that production is stopped when necessary to prevent defects from being passed on.",
    whenNotFollowed:
      'Issues are not escalated in a timely manner, leading to small problems becoming big ones. Production continues even when there are serious quality or safety issues.',
    procedure: [
      'Start: A production issue arises that requires escalation.',
      'Identify the Issue: The production team member identifies the issue and determines if it meets the criteria for escalation.',
      'Escalate to the Plant Manager: The production team member escalates the issue to the Plant Manager.',
      'Plant Manager Assessment: The Plant Manager assesses the issue and determines the appropriate course of action.',
      'Escalate to the Design Lead and Site PM (if necessary): If the issue requires input from the Design Lead or Site PM, the Plant Manager escalates to them.',
      'Escalate to the CEO (if necessary): If the issue requires CEO involvement (e.g., external commitments or financial impact), the Plant Manager escalates to the CEO.',
      "Stop the Line (if necessary): If the issue meets the 'stop the line' criteria (e.g., a safety issue, a critical quality defect), the Plant Manager stops production until the issue is resolved.",
      'Stop: The issue has been resolved and production can continue.',
    ],
    tools: [
      'Escalation ladder with named roles and response expectations',
      'Stop the line criteria',
    ],
    outputs: [
      'A resolved production issue',
      'A documented record of the escalation',
    ],
    faq: [
      {
        q: "What are the 'stop the line' criteria?",
        a: "The 'stop the line' criteria include: a safety issue, a critical quality defect that could affect the customer, or a situation where continuing production would lead to significant waste.",
      },
      {
        q: "Who has the authority to 'stop the line'?",
        a: "Any production team member has the authority to 'stop the line' if they believe there is a safety issue. The Plant Manager has the authority to 'stop the line' for quality issues.",
      },
    ],
    crossReferences: ['SOP-21', 'SOP-23', 'SOP-25'],
  },

  'SOP-38': {
    id: 'SOP-38',
    title: 'Integrated production control system (IPCS)',
    category: 'IPCS System',
    stage: 'Stage 1',
    rec: '4.0',
    finding: 'All',
    whenFollowed:
      'The entire production process, from project intake to site installation, is managed through a single, integrated system. This provides end-to-end visibility and control over all production activities.',
    whenNotFollowed:
      'The production process is managed through multiple, disconnected systems, leading to a lack of visibility, communication breakdowns, and an inability to effectively manage the production process.',
    procedure: [
      'Start: The IPCS is implemented and all team members are trained.',
      'Define the IPCS Architecture: Define the architecture of the IPCS, including the tools and systems that will be used (e.g., Basecamp, spreadsheets, physical boards).',
      'Implement the IPCS: Implement the IPCS, including setting up the tools and systems, and training all team members.',
      'Use the IPCS: All team members use the IPCS to manage their work, following the relevant SOPs.',
      'Review and Improve the IPCS: The Plant Manager reviews the IPCS regularly and makes improvements as needed.',
      'Stop: The IPCS is fully implemented and all team members are using it consistently.',
    ],
    tools: [
      'Basecamp',
      'Spreadsheets',
      'Physical boards',
      'All other tools referenced in the SOPs',
    ],
    outputs: [
      'A fully implemented and operational IPCS',
      'End-to-end visibility and control over all production activities',
    ],
    faq: [
      {
        q: 'What is the IPCS?',
        a: 'The IPCS (Integrated Production Control System) is the overall system for managing the production process, from project intake to site installation. It encompasses all the tools, systems, and SOPs used to manage production.',
      },
      {
        q: 'Who is responsible for the IPCS?',
        a: 'The Plant Manager is responsible for the IPCS, in consultation with the CEO and other key stakeholders.',
      },
    ],
    crossReferences: ['SOP-01', 'SOP-39', 'SOP-40', 'SOP-41', 'SOP-42'],
  },
};

export const STAGE1_FINDINGS: Record<string, FindingRef> = {
  E: {
    id: 'E',
    title: 'Finding E — Decision rights are unclear, pulling the CEO into daily operations',
    what:
      'Priorities and decisions route upward to avoid blame or uncertainty. When there is no trusted system for release, priority, and status, people escalate directly to leadership. The CEO becomes the default dispatcher across teams. Escalation does not consistently produce predictable corrective action, which encourages workarounds and discourages transparent reporting of issues early.',
    why:
      'Planning discipline cannot stabilize when dispatch authority is unclear. When multiple people can change priorities at any time, demand planning becomes reaction. Decision ambiguity increases fear. People avoid responsibility and protect themselves with email trails rather than resolving root causes with facts and data. CEO involvement in daily dispatch reduces throughput because the organization waits for direction instead of using clear rules and gates.',
    rootCause:
      'Tracer lacks an integrated production control system with a defined production rhythm, lookahead, and make-ready gates, so work is frequently re-prioritized late, information arrives fragmented across channels, and urgent work crowds out planned work. This increases variability and makes execution reactive rather than controlled.',
    linkedRec: 'Rec 4.5 — Clarify escalation ladder so the CEO is not the operating system',
    linkedSOPs: ['SOP-23', 'SOP-24', 'SOP-26', 'SOP-27', 'SOP-38'],
  },
  D: {
    id: 'D',
    title: 'Finding D — Handoffs are not controlled by one packet and one revision',
    what:
      'Information is spread across email, paper sheets, multiple tools, and individuals. Work instructions and critical requirements are not consistently packaged into one controlled release package. Revision control is inconsistent. The shop floor does not always have a clear method to confirm the latest approved revision before cutting, grinding, soldering, or assembling. Job-specific requirements such as interfaces, finish requirements, accessory requirements, and site constraints are not always carried in a consistent, visible format to the point of use.',
    why:
      'Wrong-revision builds and missing-item builds become more likely when the floor cannot trust the revision and does not have a single packet with routing and checks. Time is lost searching for documents, clarifying details, and reconciling conflicting instructions. This time loss fuels the urgency loop and increases defect risk. Without a standard packet and traveler signoffs, there is no simple proof that the job followed the required hold points and checks.',
    rootCause:
      'When project start inputs are unstable and handoffs are not controlled, manufacturing cannot protect itself from last-minute changes. A single Work Order Packet (WOP) tied to a single revision is the mechanism that converts design intent into controlled execution.',
    linkedRec: 'Rec 4.4 — Control handoffs with one Work Order Packet (WOP) and revision control',
    linkedSOPs: ['SOP-38', 'SOP-40'],
  },
};

export const STAGE1_RECOMMENDATIONS: Record<string, RecRef> = {
  '4.5': {
    id: '4.5',
    number: '4.5',
    title: 'Clarify escalation ladder so the CEO is not the operating system',
    description:
      'Reduce the need for real-time CEO dispatch by defining a clear priority system, decision rights, and escalation triggers. The goal is not to remove the CEO from decisions. It is to stop the CEO from being required for every decision.',
    implementationDetails: [
      'Define three priority tiers with explicit rules (P1 site shutdown or penalty risk, P2 committed shipment window, P3 routine work and stock). Tie each tier to the planning lanes in the plant schedule.',
      'Give the Plant Manager authority to sequence work within the frozen window and to reject unqualified "urgent" requests that lack minimum information.',
      'Create an escalation ladder: Plant Manager resolves first, then Design lead and Site PM, then CEO only when a decision impacts external commitments or financial exposure.',
      "Introduce a daily 10-minute plant huddle led by the Plant Manager: today's plan, blockers, and what needs escalation. Keep it factual and short.",
      'For recurring disruptive patterns (for example, a specific site team causing repeated late changes), require a corrective action with the responsible lead, not another one-off workaround.',
    ],
    minimumArtifacts: [
      'Priority tier definitions and a simple decision tree posted in the plant',
      'Escalation ladder with named roles (not names) and response expectations',
      'Daily huddle board showing plan, blockers, and escalations',
    ],
  },
  '4.0': {
    id: '4.0',
    number: '4.0',
    title: 'Guiding Principles (Non-Negotiable)',
    description:
      'Establish a small set of non-negotiable execution rules that protect flow, reduce avoidable variation, and make decision-making consistent under pressure across Site, Design, and Plant. These principles are not a "culture change." They are the operating rules that the IPCS implementation depends on. Stage 1 operationalizes two of these principles in particular: explicit decision rights, and all approvals/revisions/releases recorded in the job record rather than in private channels.',
    implementationDetails: [
      'Do not start work unless it can finish with a full kit — minimum required information, stable revision, required materials, and a clear owner.',
      'One packet and one revision controls execution. The floor does not build from email trails, verbal confirmations, or mixed sources.',
      'The plant operates on a visible daily rhythm, not the latest loudest request. Priorities are reviewed in a defined cadence.',
      'Decision rights are explicit. Escalation follows an agreed ladder with clear thresholds so leadership is not pulled into daily dispatch as the default.',
      'The daily huddle is a cross-cutting mechanism that evolves with the transformation — from a 10-minute safety standup in Stage 0 to a full production control standup in Stage 7.',
      'Site feedback is treated as operational input, not anecdote.',
    ],
    minimumArtifacts: [
      'Tracer Execution Control Charter (scope, goals, definitions, non-negotiables)',
      'RACI for Site, Design, Plant, and CEO involvement',
      'Universal job naming convention and folder structure (Basecamp as system of record)',
      'Standard terminology glossary',
      'Core templates: Job Packet cover page, Change Request, Nonconformance tag, Pack List',
      'Escalation ladder with decision thresholds and owners',
    ],
  },
};
