// Consolidated references for Stages 2-7.
// SOP titles, cross-references, and stage/rec/finding tags are grounded in
// the Tracer Audit Report Final v43-2 (Action Plan Linked SOPs + each
// Recommendation's Linked SOPs list). Procedure / tools / outputs / FAQ
// bodies are authored from the audit's Implementation Details and Minimum
// Required Artifacts for the associated recommendation, so they remain
// audit-aligned even where the SOP site's verbatim text hasn't been pulled
// tab-by-tab yet. (Stage 1 references in stage1References.ts carry the
// fully verbatim site-captured bodies; the rest will be swapped in as each
// stage gets exercised.)

import type { SOPRef, FindingRef, RecRef } from './stage0References';

// ============================================================================
// SOPs
// ============================================================================

export const EXTENDED_SOPS: Record<string, SOPRef> = {
  // ---------- Stage 2: Intake & Readiness ----------
  'SOP-03': {
    id: 'SOP-03',
    title: 'Project intake checklist and minimum inputs',
    category: 'Project Start',
    stage: 'Stage 2',
    rec: '4.1',
    finding: 'B, C',
    whenFollowed:
      'Every project enters through one checklist with a minimum data set (DWG, quantities, key dimensions, CTQs, constraints). Incomplete requests are caught at the front door, not discovered mid-build.',
    whenNotFollowed:
      'Requests enter through email, verbal, or whatever channel was handy. The plant starts work on jobs missing information; defects and rework follow.',
    procedure: [
      'Requester opens the standard Manufacturing Request form (or checklist).',
      'Fill mandatory fields: scope summary, target install window, planned shipment window, DWG source, quantities, key dimensions, naming/labeling convention.',
      'If the request is truly urgent, select the emergency path: the same form is still completed, and the missing items are explicitly listed.',
      'Submit to the first planner for readiness review (see SOP-04).',
      'The first planner returns the request if anything mandatory is missing.',
    ],
    tools: [
      'Manufacturing Request form (paper or Basecamp form)',
      'Project Start Pack template',
      'Naming and labeling convention',
    ],
    outputs: [
      'A complete Project Start Pack attached to the job record',
      'A readiness-review trigger that sends the request to the first planner',
    ],
    faq: [
      {
        q: 'What counts as an "emergency" that can bypass the form?',
        a: 'Nothing bypasses the form. Emergencies still use the form — they tick the emergency box, list what is missing, and name who approves the risk.',
      },
    ],
    crossReferences: ['SOP-04', 'SOP-05', 'SOP-06', 'SOP-18'],
  },
  'SOP-04': {
    id: 'SOP-04',
    title: 'Project kickoff and risk categorization (readiness gate checklist)',
    category: 'Project Start',
    stage: 'Stage 2',
    rec: '4.1',
    finding: 'B, C',
    whenFollowed:
      'Each request is categorized — standard vs custom, prototype needed or not, critical dates — and moves through named readiness states (Not Ready → Ready for Planning → Ready for Release → Released). Nothing goes to the plant queue until it is Released.',
    whenNotFollowed:
      'Work enters the plant at the "Not Ready" stage and stalls mid-build waiting for decisions. Prototype-worthy jobs are launched without a prototype.',
    procedure: [
      'First planner (or delegate) opens the request.',
      'Score readiness against the checklist: approvals in place, latest revision, correct part IDs, materials available, site measurements.',
      'Categorize: Standard, Custom, or Prototype-required.',
      'Set readiness state: Not Ready / Ready for Planning / Ready for Release / Released.',
      'If Not Ready, list what is blocking and route back to requester.',
      'If Prototype-required, trigger SOP-07 first-of-series workflow before series production.',
    ],
    tools: ['Readiness Gate checklist', 'First Planner queue'],
    outputs: [
      'Readiness state recorded on the job record',
      'Blocker list routed back to requester (if applicable)',
    ],
    faq: [
      {
        q: 'Who owns the first planner role at Tracer?',
        a: 'Per the audit Action Plan, the first planner can be Jordi or a named delegate — the point is that someone is accountable for the readiness review.',
      },
    ],
    crossReferences: ['SOP-03', 'SOP-05', 'SOP-06', 'SOP-07', 'SOP-18'],
  },

  // ---------- Stage 3: Planning Cadence ----------
  'SOP-08': {
    id: 'SOP-08',
    title: 'Standard parts cycle time capture (by operation)',
    category: 'Planning',
    stage: 'Stage 3',
    rec: '4.2',
    finding: 'B, H',
    whenFollowed:
      'Every repeatable part has a documented baseline cycle time per operation (laser, folding, welding, finishing). Planning commits are credible and standard parts inventory targets are grounded in data, not guesswork.',
    whenNotFollowed:
      'Cycle times live in individual memory. Schedule promises drift, inventory targets are arbitrary, and the plant cannot tell a capacity problem from a planning problem.',
    procedure: [
      'Select the top 10–20 repeatable parts (rails, omégas, lisses, standard variants).',
      'At each operation the part passes through, run a quick time study: record run time and quantity for 3–5 samples.',
      'Capture a min/typical/max range rather than a single point estimate.',
      'Post the cycle-time sheet at the work area and review monthly.',
    ],
    tools: ['Cycle time sheet per part', 'Stopwatch or phone timer'],
    outputs: [
      'Cycle-time master data per part × operation',
      'Baseline for planning, capacity loading, and consumption estimates',
    ],
    faq: [
      {
        q: 'What if run times vary a lot?',
        a: 'Capture the range and note the driver (material, batch size, setup). Variability is information — do not force it to a single number.',
      },
    ],
    crossReferences: ['SOP-09', 'SOP-10', 'SOP-33', 'SOP-39'],
  },
  'SOP-09': {
    id: 'SOP-09',
    title: 'Standard parts consumption model (by project type)',
    category: 'Planning',
    stage: 'Stage 3',
    rec: '4.2',
    finding: 'B, H',
    whenFollowed:
      'Each project type carries a documented typical consumption of standard parts (per linear metre of wall, per module, per façade type). The plant can pre-produce during capacity gaps with confidence.',
    whenNotFollowed:
      'Standard parts are only built when a project triggers them, mixing predictable work into crisis custom work and inflating WIP.',
    procedure: [
      'List project types (by scope archetype).',
      'For each project type, tabulate average consumption of standard parts.',
      'Refine monthly as actuals come in.',
      'Feed targets into min/max replenishment rules (SOP-34).',
    ],
    tools: ['Consumption estimate sheet', 'Historical job data'],
    outputs: [
      'Consumption estimates per project type',
      'Inputs for min/max inventory targets and make-to-stock triggers',
    ],
    faq: [
      {
        q: 'How accurate do these estimates need to be to start?',
        a: 'Rough is fine. Start with best estimates, refine monthly — the point is to make the "standard vs custom" split visible.',
      },
    ],
    crossReferences: ['SOP-08', 'SOP-10', 'SOP-33', 'SOP-34'],
  },
  'SOP-39': {
    id: 'SOP-39',
    title: 'Planning cadence (daily / weekly / monthly)',
    category: 'Planning',
    stage: 'Stage 3',
    rec: '4.2',
    finding: 'B',
    whenFollowed:
      'A recurring planning cycle locks a near-term commitment set, keeps a visible queue of ready-but-unreleased work, and produces a simple day-plan for the plant and a matching request list for site. Priorities stop bouncing daily.',
    whenNotFollowed:
      '"Latest loudest" wins. Daily dispatch drifts with the last phone call.',
    procedure: [
      'Daily (10 min): huddle at the production board — today\'s plan, blockers, escalations.',
      'Weekly (60 min): capacity review — available hours by operation, constraints, next-week commitments. Lock early in the week.',
      'Monthly: portfolio-level macro plan review. What ships next month, in what sequence.',
      'Maintain three lanes: Planned production (frozen 5 days), Expedite (limited reserved capacity), Standard replenishment.',
    ],
    tools: [
      'Weekly production plan (one page / board view with three lanes)',
      'Expedite request form',
      'Operation capacity assumptions (baseline hours per day)',
      'WIP limits by operation',
    ],
    outputs: [
      'Locked weekly plan',
      'Visible queue of ready-but-unreleased work',
      'Daily day-plan and a matching site request list',
    ],
    faq: [
      {
        q: 'Can we still expedite?',
        a: 'Yes — through the expedite lane, with a reason, required ship date, and explicit impact if not shipped. Expedite is counted and visible.',
      },
    ],
    crossReferences: ['SOP-08', 'SOP-09', 'SOP-10', 'SOP-11'],
  },

  // ---------- Stage 4: Release to Production (WOP) ----------
  'SOP-13': {
    id: 'SOP-13',
    title: 'Incoming work packet QC check',
    category: 'Quality',
    stage: 'Stage 4',
    rec: '4.3',
    finding: 'A, C',
    whenFollowed:
      'Before any job enters the first operation, someone verifies the drawing set, revision, critical dimensions, and CTQs. Wrong-revision builds and missing-dimension builds are caught at the door.',
    whenNotFollowed:
      'The floor assumes the packet is correct because nobody checks. Defects made from wrong-revision drawings become rework later.',
    procedure: [
      'Open the Work Order Packet.',
      'Verify: drawing set present, revision number matches release record, critical dimensions legible, CTQs explicitly listed.',
      'If anything fails, tag the packet HOLD and escalate to the Plant Manager.',
      'Record the incoming QC signoff on the traveler.',
    ],
    tools: ['Work Order Packet template', 'Traveler', 'HOLD area'],
    outputs: ['Signed incoming QC check on the traveler', 'HOLD tag if needed'],
    faq: [
      {
        q: 'Who does the incoming check?',
        a: 'Typically the first operator at the first operation (e.g. laser). The check takes ~2 minutes.',
      },
    ],
    crossReferences: ['SOP-14', 'SOP-15', 'SOP-18', 'SOP-20'],
  },
  'SOP-18': {
    id: 'SOP-18',
    title: 'Work Order Packet (WOP) creation and release to production',
    category: 'Handoffs / WOP',
    stage: 'Stage 4',
    rec: '4.4',
    finding: 'C, D',
    whenFollowed:
      'Every release to production has one WOP as its single source of truth: latest approved plan set, parts list with IDs, fold directions/angles, finishing requirements, pack list. The floor builds from the WOP, not from email.',
    whenNotFollowed:
      'Design intent scatters across email, verbal handoffs, and sticky notes taped to machines. The same part gets built three times three different ways.',
    procedure: [
      'On release, generate the WOP from the Project Start Pack + latest approved revision.',
      'Include: scope summary, parts list, revision ID, finishing and labeling requirements, pack list.',
      'Assign a print control point so only the current WOP version is in circulation.',
      'Route the WOP to the first operation with a traveler attached.',
      'Archive superseded versions in Basecamp; do not delete.',
    ],
    tools: ['WOP template (PDF)', 'Basecamp archive', 'Traveler template'],
    outputs: ['A single WOP per release', 'Archived history of superseded versions'],
    faq: [
      {
        q: 'Can we release a WOP for a partial job?',
        a: 'Only when the item is explicitly categorized standard / non-changing per Rec 4.1.',
      },
    ],
    crossReferences: ['SOP-13', 'SOP-19', 'SOP-20', 'SOP-21', 'SOP-22'],
  },
  'SOP-19': {
    id: 'SOP-19',
    title: 'Revision control and naming convention in Basecamp',
    category: 'Handoffs / WOP',
    stage: 'Stage 4',
    rec: '4.4',
    finding: 'C',
    whenFollowed:
      'All project documents are named and versioned per the standard. Everyone works from the latest revision and there is a clear audit trail of changes.',
    whenNotFollowed:
      'Multiple versions of the same document circulate. Work gets built from outdated information and there is no clean way to trace what changed when.',
    procedure: [
      'Name every document: [Project Name]-[Document Type]-[Revision Number]-[Date].',
      'Each update increments the revision number (starting at Rev 0).',
      'Upload to the correct Basecamp folder.',
      'Notify stakeholders of new versions.',
      'Archive the previous version in a designated archive folder.',
    ],
    tools: ['Basecamp', 'Document naming convention guide'],
    outputs: ['A clearly named and versioned document', 'A clear audit trail of changes'],
    faq: [
      {
        q: "What's the standard naming convention?",
        a: '[Project Name]-[Document Type]-[Revision Number]-[Date] — e.g. ProjectA-WOP-Rev2-2024-01-15.',
      },
      {
        q: "What if I can't find the latest version?",
        a: 'Always check Basecamp. If unsure, contact the document owner.',
      },
    ],
    crossReferences: ['SOP-05', 'SOP-18', 'SOP-20', 'SOP-40'],
  },

  // ---------- Stage 5: Quality at Source ----------
  'SOP-14': {
    id: 'SOP-14',
    title: 'CTQ definition and first-article verification',
    category: 'Quality',
    stage: 'Stage 5',
    rec: '4.3',
    finding: 'A',
    whenFollowed:
      'Critical-to-quality characteristics are defined per work-package type. Any new or changed work package runs a first-article check before series production.',
    whenNotFollowed:
      'Series production runs on the first part without verifying fit, labeling, or finish. Defects replicate at batch scale.',
    procedure: [
      'Define CTQs per work-package type (dimensions, finish, labeling, critical holes).',
      'On first run of a new or changed package, produce one part and run the first-article check.',
      'Verify against CTQs; if any fail, hold and investigate before proceeding.',
      'Update standards immediately based on what is learned.',
    ],
    tools: ['CTQ definition sheet', 'First-article checklist'],
    outputs: ['Signed-off first-article record', 'Updated standards (if changes found)'],
    faq: [
      {
        q: 'How many CTQs per work-package type?',
        a: 'Enough to catch the defect modes that actually recur — typically 3–8. Do not over-engineer.',
      },
    ],
    crossReferences: ['SOP-13', 'SOP-15', 'SOP-16', 'SOP-20'],
  },
  'SOP-15': {
    id: 'SOP-15',
    title: 'In-process QC checks (sampling + signoff)',
    category: 'Quality',
    stage: 'Stage 5',
    rec: '4.3',
    finding: 'A',
    whenFollowed:
      'A 2-minute visual and dimensional check happens at every handoff (cutting → folding → welding → finishing → packing). Defects surface at source, not at shipment.',
    whenNotFollowed:
      'Defects travel downstream and compound. The same mistake becomes a redraw, a recut, a repaint, a repack.',
    procedure: [
      'At each handoff, the receiving operator runs the 2-minute check.',
      'Log any defect with the standard code set (10–15 codes total, no free text).',
      'If the defect is critical, tag HOLD and route to quality owner.',
      'Sign off on the traveler and pass the work on.',
    ],
    tools: ['QC checklist per operation', 'Standard defect code set', 'Traveler'],
    outputs: ['Signed in-process QC checks on traveler', 'Defect log entries'],
    faq: [
      {
        q: 'Does this slow down production?',
        a: '2 minutes per handoff prevents hours of rework downstream. It pays back on the first defect caught.',
      },
    ],
    crossReferences: ['SOP-13', 'SOP-14', 'SOP-16', 'SOP-20'],
  },
  'SOP-16': {
    id: 'SOP-16',
    title: 'Nonconformance, rework, and feedback loop',
    category: 'Quality',
    stage: 'Stage 5',
    rec: '4.3',
    finding: 'A',
    whenFollowed:
      'Every nonconformance is tagged, dispositioned, root-caused, and fed back into standards. Repeated defects show decreasing recurrence.',
    whenNotFollowed:
      'Defects are handled informally. The same mistake recurs on the next job because nothing upstream changed.',
    procedure: [
      'When a defect is detected, tag the part (NCR tag).',
      'Move to HOLD area until disposition is decided (use-as-is, rework, scrap).',
      'Assign defect code and root-cause category (design gap, site change, labeling, fabrication, supplier).',
      'Log in the NCR log tied to the job record.',
      'Run the weekly 20-minute QC review: top 3 defects, one concrete countermeasure per top defect.',
      'Verify standards/templates/labels actually got updated.',
    ],
    tools: ['NCR tag', 'NCR log', 'Defect code set', 'Weekly QC review agenda'],
    outputs: [
      'NCR log entries with disposition',
      'Weekly top-defect summary + countermeasures',
      'Updated standards where root cause points upstream',
    ],
    faq: [
      {
        q: 'What happens to a "use as is" disposition?',
        a: 'It is recorded with rationale and customer-impact note. Not a default option — requires explicit approval.',
      },
    ],
    crossReferences: ['SOP-14', 'SOP-15', 'SOP-20', 'SOP-17'],
  },
  'SOP-20': {
    id: 'SOP-20',
    title: 'Production traveler and station signoff',
    category: 'Handoffs / WOP',
    stage: 'Stage 4',
    rec: '4.4',
    finding: 'C, D',
    whenFollowed:
      'A traveler follows the WOP through every operation. Each station signs off. Hold points are visible, and nothing ships without the full signoff chain.',
    whenNotFollowed:
      'There is no proof the work followed the required hold points and checks. Silent defects move downstream.',
    procedure: [
      'Traveler is stapled or attached to the WOP on release.',
      'Each operation fills in operator, date, time, and signs off.',
      'QC checks at handoffs are recorded on the traveler.',
      'Final signoff at pack-out verifies everything upstream was signed.',
      'Traveler is filed with the job record at closeout.',
    ],
    tools: ['Traveler template', 'WOP'],
    outputs: ['Signed-off traveler as the closeout audit trail'],
    faq: [
      {
        q: 'What if an operator forgets to sign?',
        a: 'The downstream operator refuses to accept the work until the upstream signoff is resolved.',
      },
    ],
    crossReferences: ['SOP-13', 'SOP-15', 'SOP-18', 'SOP-19'],
  },

  // ---------- Stage 6: Site Integration & Closeout ----------
  'SOP-17': {
    id: 'SOP-17',
    title: 'Site fit-up and sur-mesure request intake',
    category: 'Handoffs / WOP',
    stage: 'Stage 6',
    rec: '4.3',
    finding: 'C',
    whenFollowed:
      'Site teams send field-adjustment requests in a structured format (photos, measurements, piece ID, due need date). The plant can act without re-interpreting hand-written notes.',
    whenNotFollowed:
      'Requests arrive as text messages with blurry photos. The plant re-asks for dimensions and the urgency compounds.',
    procedure: [
      'Site lead opens the Field Adjustment request form.',
      'Attach: photos (multiple angles), measurements, piece ID (per part-ID standard), due need date, module/terrace reference.',
      'Indicate if it\'s a planned cut-to-fit ("fuse") item or a new variance.',
      'Submit via the defined channel; the plant acknowledges within the response window.',
    ],
    tools: ['Field Adjustment request form', 'Part-ID standard', 'Installation packet'],
    outputs: ['A structured field-adjustment entry tied to the job'],
    faq: [
      {
        q: 'What\'s a "fuse" item?',
        a: 'A component designed to be trimmed or adjusted on site — dimensions that cannot be confirmed reliably before install. Documented up front so the plant is not surprised.',
      },
    ],
    crossReferences: ['SOP-21', 'SOP-22', 'SOP-06'],
  },
  'SOP-21': {
    id: 'SOP-21',
    title: 'Punch list, site feedback, and closeout loop',
    category: 'Handoffs / WOP',
    stage: 'Stage 6',
    rec: '4.1',
    finding: 'C',
    whenFollowed:
      'Every job closes with a punch list and a site-feedback capture. Recurring issues update templates and standards, not just get "fixed" once.',
    whenNotFollowed:
      'The same site issues recur job after job because nobody updates the upstream standards.',
    procedure: [
      'At substantial completion, walk the site with installer lead.',
      'Capture punch items: open defects, missing items, wrong labels, fit issues.',
      'Disposition each item (plant remake, on-site correction, accept-as-is with customer approval).',
      'File a closeout entry: what recurred, what standards/templates should change.',
      'Route template/standard updates to the governance owner.',
    ],
    tools: ['Punch list template', 'Closeout log', 'Template change notice'],
    outputs: ['Closed punch list', 'Closeout lessons-learned entry', 'Upstream standard updates'],
    faq: [
      {
        q: 'Who owns closeout updates to standards?',
        a: 'The governance owner defined in Stage 7 — typically the Plant Manager in consultation with Design Lead.',
      },
    ],
    crossReferences: ['SOP-17', 'SOP-22', 'SOP-16', 'SOP-29'],
  },
  'SOP-22': {
    id: 'SOP-22',
    title: 'Shipment readiness checklist',
    category: 'Handoffs / WOP',
    stage: 'Stage 6',
    rec: '4.4',
    finding: 'C, D',
    whenFollowed:
      'No pallet leaves without a pack-verification step: counted items, verified labels, pallet photo, attached pack list. Missing-item chases drop dramatically.',
    whenNotFollowed:
      'Pallets are assembled from memory and dispatched without verification. Site receives partial kits and the remake cycle starts.',
    procedure: [
      'At pack-out, run the shipment-readiness checklist.',
      'Count items against the pack list.',
      'Verify each label is legible and matches the part ID standard.',
      'Photograph each pallet (front, sides, label closeups).',
      'Attach the pack list physically to the pallet.',
      'Store photos and pack list with the job record.',
    ],
    tools: ['Shipment readiness checklist', 'Pack list template', 'Phone camera'],
    outputs: [
      'Verified shipment with pack list and photos attached',
      'Audit trail tied to the job record',
    ],
    faq: [
      {
        q: 'What if something is missing at pack-out?',
        a: 'Do not ship incomplete. Tag HOLD, escalate, and resolve before dispatch. A complete ship later is cheaper than a missing-part chase.',
      },
    ],
    crossReferences: ['SOP-18', 'SOP-20', 'SOP-21', 'SOP-36'],
  },

  // ---------- Stage 7: Sustainment & CI ----------
  'SOP-25': {
    id: 'SOP-25',
    title: 'Accountability rules (no bypass, escalation, exceptions log)',
    category: 'Governance',
    stage: 'Stage 7',
    rec: '4.0',
    finding: 'E',
    whenFollowed:
      'The execution control system has teeth: bypasses are logged and reviewed, exceptions produce corrective actions, and adherence is visible at the leadership cadence.',
    whenNotFollowed:
      'The system decays under pressure. Bypasses become the new normal and the improvements from earlier stages quietly unwind.',
    procedure: [
      'Define the "no bypass" rules (what must never be skipped — intake form, release gate, labeling, QC signoff).',
      'Every bypass logs to an exceptions register with reason and approver.',
      'Weekly: review the exceptions register; any pattern triggers a corrective action.',
      'Monthly: management review — adherence metrics + top corrective actions status.',
    ],
    tools: ['Exceptions log', 'Accountability cadence agenda', 'Governance owner role'],
    outputs: ['Exceptions register', 'Corrective action list with owners'],
    faq: [
      {
        q: 'Is there ever a legitimate reason to bypass?',
        a: 'Yes — that\'s why we log exceptions rather than denying them. The logging + review is what keeps bypass from becoming the default.',
      },
    ],
    crossReferences: ['SOP-23', 'SOP-24', 'SOP-28', 'SOP-29'],
  },
  'SOP-28': {
    id: 'SOP-28',
    title: 'Training-in-the-work (TWI) and skill matrix',
    category: 'Dashboard / KPIs',
    stage: 'Stage 7',
    rec: '4.0',
    finding: 'E',
    whenFollowed:
      'Every role has a skill matrix and a training record. New hires are trained at the workstation on the active SOPs, with competence verified by the direct lead.',
    whenNotFollowed:
      'Knowledge lives in individual memory. Turnover is catastrophic and onboarding takes months.',
    procedure: [
      'Build the skill matrix: roles × skills × proficiency levels.',
      'For each new hire, run workstation-based training using active SOPs.',
      'Direct lead signs the competence checklist.',
      'Layered process audits include a training compliance check.',
    ],
    tools: ['Skill matrix spreadsheet', 'Competence checklist', 'Active SOP library'],
    outputs: ['Training records per employee', 'Signed competence checklists'],
    faq: [
      {
        q: 'What if an SOP changes?',
        a: 'Anyone whose role is affected gets refreshed and the training record is updated. The LPA check will catch it if missed.',
      },
    ],
    crossReferences: ['SOP-25', 'SOP-29'],
  },
  'SOP-29': {
    id: 'SOP-29',
    title: 'Layered process audits (LPA) and sustaining 5S',
    category: 'Governance',
    stage: 'Stage 7',
    rec: '4.6',
    finding: 'A, F, G',
    whenFollowed:
      'Leaders at every layer walk the floor against a published checklist (intake, release, traveler usage, labeling, QC signoff, 5S). Gaps become coaching moments, not ambushes.',
    whenNotFollowed:
      'Improvements from earlier stages decay silently. By the time the problem is visible, it has recurred for months.',
    procedure: [
      'Publish the LPA checklist (intake, release, traveler, labeling, QC, 5S).',
      'Define the layered cadence: Team leads daily, Plant Manager weekly, CEO/governance monthly.',
      'During each audit, record the score and the corrective action (if any).',
      'Feed corrective actions into the improvement backlog.',
    ],
    tools: ['LPA checklist', 'Improvement backlog'],
    outputs: ['LPA score trend', 'Corrective action list'],
    faq: [
      {
        q: 'Who is "auditor" vs "auditee"?',
        a: 'Everyone is both. Layered means leaders at every level both audit and get audited — that\'s what prevents hiding.',
      },
    ],
    crossReferences: ['SOP-25', 'SOP-28', 'SOP-38'],
  },
};

// ============================================================================
// Findings
// ============================================================================

export const EXTENDED_FINDINGS: Record<string, FindingRef> = {
  A: {
    id: 'A',
    title: 'Finding A — Quality Control (QC) is missing, so defects are not traceable',
    what:
      'There are no standard incoming, in-process, and final QC checks that apply to every job, and no consistent method to combine standard checks with job-specific CTQs. There is no NCR log, no formal containment routine, and no standardized rework traveler. Defects are often discovered late — after shipment, on site, or during payment disputes — indicating detection is happening downstream rather than at the point of creation.',
    why:
      'Without defect data, teams debate where the problem started and the organization cannot separate design-translation errors from fabrication errors from packing errors. Late discovery multiplies cost — the same mistake becomes a redraw, a recut, a repaint, a repack, and an urgent site fix instead of a controlled correction inside the plant. Without containment, suspect parts can quietly re-enter flow, reducing trust in final inspection.',
    rootCause:
      'When upstream inputs shift, defect probability increases across the entire chain. Without QC data, Tracer cannot see which failure modes are most common, which are most expensive, and which are most tied to late changes or weak project preparation. A QC baseline is required to create a measurable improvement loop, but it will only deliver stable results once project start inputs and release discipline are stabilized.',
    linkedRec: 'Rec 4.3 — Add a QC baseline to create defect data immediately',
    linkedSOPs: ['SOP-13', 'SOP-14', 'SOP-15', 'SOP-16', 'SOP-20'],
  },
  B: {
    id: 'B',
    title: 'Finding B — Demand planning is unstable and frequently reactive',
    what:
      'Tracer frequently manufactures under compressed lead times because information arrives late or changes after work starts. Drivers: (1) client/site reality pushes late decisions and sur-mesure; (2) Tracer has limited buffer stock and limited capacity visibility, so any late change becomes an emergency. When the plant has a capacity gap, it could pre-produce standard components (rails, omégas, lisses) but does not reliably do so because there is no agreed stock policy and no documented time/quantity master data. The result is a "latest loudest" schedule: small urgent requests interrupt larger planned jobs.',
    why:
      'When the plant cannot distinguish planned work from emergency work, the cost of urgency is invisible. Expedites displace planned jobs, extend lead times for other projects, and force overtime. Without documented cycle times and consumption data for repeatable parts, planning commits are not credible and management cannot distinguish a capacity problem from a planning problem.',
    rootCause:
      'The organization is operating without an execution control system that converts unavoidable site variability into controlled, scheduled work. The challenge is not to eliminate late site changes — it is to control them: define what is safe to start early, what must wait for visa, and how revisions, labeling, and shipment completeness are verified in a single closed-loop workflow.',
    linkedRec: 'Rec 4.2 — Install demand planning discipline inside the plant',
    linkedSOPs: ['SOP-08', 'SOP-09', 'SOP-10', 'SOP-11', 'SOP-39'],
  },
  C: {
    id: 'C',
    title: 'Finding C — The plant is receiving incomplete or changing information after production starts',
    what:
      'Release to production is not consistently defined. Work sometimes starts on verbal or internal confirmation, or on the assumption that client visa will arrive in time. Loose drawings stack at machine workstations; dimensions and calculations get written directly on the machine casing. Labeling and part identification are not standardized.',
    why:
      'When a job releases without a controlled gate, the plant may build to an unstable revision — the cost shows up as rework, scrapped time, and urgent remake requests that displace other work. Even correct parts can arrive on site but still consume hours of sorting, measuring, and confirming what goes where.',
    rootCause:
      'Without an integrated production control system, Tracer does not have a consistent definition of "ready to produce" (including controlled pre-visa starts), nor a closed-loop method to manage changes from design/site through fabrication, packing, shipping, installation, and field-driven adjustments.',
    linkedRec: 'Rec 4.1 — Strengthen project start preparation and validation',
    linkedSOPs: ['SOP-03', 'SOP-04', 'SOP-05', 'SOP-18', 'SOP-19'],
  },
  G: {
    id: 'G',
    title: 'Finding G — No single visible dashboard for priorities and status',
    what:
      'There is no single dashboard that everyone can see and trust. Information is split across paper production sheets, messages, emails, calls, and different planning views. The manufacturing view is not connected to the Site PM view of demand and constraints. The Plant Manager does not have one daily control view used to run dispatch and protect the plan from constant ad-hoc change.',
    why:
      'When the Site PM view is disconnected from the plant view, the factory receives late or conflicting signals about what is truly ready, approved, and urgent. Priorities are not consistently visible, so work gets reordered by whoever calls last or escalates most. Capacity cannot be managed without one trusted view of demand, due dates, readiness, and blockers.',
    rootCause:
      'A dashboard does not fix unstable upstream inputs by itself, but it exposes instability and forces clarity on what is approved, released, and scheduled. For it to work at Tracer, the plant dashboard must be linked to the Site PM view so readiness signals are visible in one place.',
    linkedRec: 'Rec 4.6 — Establish a single operational dashboard',
    linkedSOPs: ['SOP-28', 'SOP-29', 'SOP-30', 'SOP-31', 'SOP-32'],
  },
  H: {
    id: 'H',
    title: 'Finding H — Standard parts are not leveraged through inventory, increasing load on custom work',
    what:
      'A significant portion of manufactured pieces are repeatable and follow known specifications, but they are produced only when a project triggers them, rather than being stocked as standard inventory items. Standard parts are not treated as SKUs with min/max levels, so the organization cannot quantify how much of each project is standard vs custom and cannot smooth demand by building ahead of time.',
    why:
      'When standard parts are built only at the moment of need, demand planning becomes more volatile and WIP increases. The plant is forced to mix predictable work with urgent custom work, which increases context switching and defect risk. If standard parts were available, the plant could kit projects faster and reduce late site-driven interruptions.',
    rootCause:
      'Unstable project starts and reactive planning hide the true repeatability in the product mix. A controlled release gate and a connected dashboard will make the standard-vs-custom split visible. Once visible, Tracer can treat repeatable parts as standard inventory items.',
    linkedRec: 'Rec 4.7 — Establish a standard parts inventory strategy',
    linkedSOPs: ['SOP-33', 'SOP-34', 'SOP-35', 'SOP-36', 'SOP-37'],
  },
};

// ============================================================================
// Recommendations
// ============================================================================

export const EXTENDED_RECS: Record<string, RecRef> = {
  '4.1': {
    id: '4.1',
    number: '4.1',
    title: 'Strengthen project start preparation and validation',
    description:
      'Make project start preparation reliable enough that manufacturing receives stable, usable inputs early, while still acknowledging that site-driven uncertainty will exist on complex jobs. Replace ad hoc urgency with a controlled release signal, clear ownership, and an explicit plan for what is known now versus what will be closed later on site.',
    implementationDetails: [
      'Create a single "Project Start Pack" for every job capturing scope, target install/ship windows, DWG source, quantities, key dimensions, naming/labeling convention.',
      'Define a formal "Ready to Produce" gate with Site PM / Design Lead / Plant Manager signoffs. Only Released items enter the plant queue.',
      'Introduce an explicit First-of-Series / Prototype trigger for high-risk interfaces: build one controlled unit, validate on site, freeze the design for series production.',
      'Standardize the use of "fuses" (oversize / cut-to-fit elements) for dimensions that cannot be confirmed early.',
      'Require a short pre-release risk scan for each job: what can change, what cannot, what is released now, what will be released later.',
    ],
    minimumArtifacts: [
      'Project Start Pack (one page) per job',
      'Release to Production form (date, revision, item list, due date, signoffs)',
      'Prototype plan when applicable',
      'Cut-to-fit ("fuses") list with measurement accountability',
      'Change log (what changed, why, rework impact)',
    ],
  },
  '4.2': {
    id: '4.2',
    number: '4.2',
    title: 'Install demand planning discipline inside the plant',
    description:
      'Create a predictable production plan that separates planned work from true emergencies, protects capacity for custom projects, and reduces the daily priority chaos that drives mistakes and late shipments.',
    implementationDetails: [
      'Run the IPCS planning ladder: portfolio macro plan → pull plan from site need-date back → norm-level production plan → last-planner make-ready. Output: a simple day-plan for the plant and a matching request list for site.',
      'Single plant schedule with three lanes: Planned production (frozen 5 days), Expedite (reserved limited capacity), Standard replenishment.',
      'Define expedite criteria and require a reason + required ship date + impact on every expedite request.',
      'Weekly capacity review with the Plant Manager. Lock the plan early in the week.',
      'WIP limits per operation. Default = finish and ship correctly, not start new work.',
      'Pull by release: if it is not released, it is not started.',
    ],
    minimumArtifacts: [
      'Weekly production plan with three lanes and capacity notes',
      'Expedite request form',
      'Operation capacity assumptions (quarterly refresh)',
      'WIP limits and stop-start rule',
    ],
  },
  '4.3': {
    id: '4.3',
    number: '4.3',
    title: 'Add a Quality Control (QC) baseline to create defect data immediately',
    description:
      'Create fast, simple defect visibility so Tracer can stop repeating the same errors. Capture a minimum set of defect categories, locations, and causes so the team can target the highest-impact failure modes.',
    implementationDetails: [
      '2-minute QC check at each handoff (cutting, folding, welding, finishing, packing). Visual + dimensional, focused on the top recurring issues.',
      'Standardize defect codes (10–15 max). One code per defect, no free text except notes.',
      'Log defects in one place tied to the job and operation. Make it part of the WOP where possible.',
      'Separate "before shipment" from "on site" defects — site defects are usually the most expensive.',
      'Weekly 20-minute QC review: top 3 defects, one concrete countermeasure per defect for the next week.',
    ],
    minimumArtifacts: [
      'QC checklist per operation (one page total)',
      'Defect log (job, operation, defect code, detected by, rework time, shipped or not)',
      'Weekly QC summary posted visibly',
    ],
  },
  '4.4': {
    id: '4.4',
    number: '4.4',
    title: 'Control handoffs with one Work Order Packet (WOP) and revision control',
    description:
      'Create a closed-loop handoff between Design, Plant, and Site so the correct revision is built, the correct items are shipped, and the site team can identify parts without guessing. The WOP becomes the physical and digital control object that follows the work.',
    implementationDetails: [
      'One WOP per job release: latest approved plan set, parts list with IDs, fold directions/angles, finishing requirements, pack list by pallet/zone.',
      'Enforce revision control: one active revision, older revisions archived. Any post-release change requires a new release record and explicit disposition of in-progress work.',
      'Standardize labeling inside the WOP: part codes, zone/floor/terrace identifiers, what gets labeled at which operation.',
      'At pack-out: count items, verify labels, photograph each pallet, attach pack list, store photos with the job.',
      'Route shop-floor questions through the Plant Manager and the WOP, not ad hoc designer interruptions.',
    ],
    minimumArtifacts: [
      'Work Order Packet template (PDF + digital home)',
      'Parts list with unique IDs',
      'Pack list per pallet/zone plus pack-out photos',
      'Revision change notice template',
    ],
  },
  '4.6': {
    id: '4.6',
    number: '4.6',
    title: 'Establish a single operational dashboard visible to everyone',
    description:
      'Make the operating system visible. The dashboard is not a report — it is a shared control panel that shows what is supposed to happen, what is blocked, and what requires attention today.',
    implementationDetails: [
      'One-screen daily dashboard: releases waiting, WIP by operation, shipments due this week, expedites, top blockers.',
      'Use the dashboard as the agenda for the daily plant huddle. If it is not on the dashboard, it is not discussed.',
      'Two leading indicators: (1) jobs released with complete WOP, (2) WIP age by operation.',
      'Lookahead + make-ready pane: upcoming releases, visa status, expected site fuse measurements, top constraints.',
      'Simple flow-interruption register with owner and next action.',
      'Keep it to 10–15 fields, updated by Plant Manager in <10 min/day.',
    ],
    minimumArtifacts: [
      'Dashboard field definitions + ownership',
      'Daily huddle routine + standard script',
      'Weekly leadership rollup view',
    ],
  },
  '4.7': {
    id: '4.7',
    number: '4.7',
    title: 'Establish a standard parts inventory strategy',
    description:
      'Reduce design and laser bottlenecks by treating repeatable parts (rails, omégas, lisses, and similar) as managed inventory, supported by documented cycle times and standard consumption estimates. Protects capacity for custom work and shortens response time for small site requests.',
    implementationDetails: [
      'Standard parts catalog: top 10–20 items with codes, dimensions, material, usage.',
      'Baseline cycle time per standard part by operation (ranges acceptable).',
      'Standard consumption by project type, refined monthly.',
      'Min/max inventory targets with named replenishment owners.',
      'Recurring replenishment slot in the schedule (e.g. half-day per week).',
      'Physical staging map with labeled lanes; parts move only with owner + label.',
      '5S-style standards for error-prone areas: laser output, folding output, weld queue, finished goods, shipping.',
    ],
    minimumArtifacts: [
      'Standard parts catalog + specs',
      'Cycle time sheet per standard part',
      'Consumption estimate sheet by project type',
      'Min/max targets + stock count routine',
      'Staging map + labeling rules',
    ],
  },
};
