// @ts-nocheck
// Stage flow configs — one per stage (2-7). Stage 0 and Stage 1 keep their
// bespoke components. Each config declares:
//   - referenceChips:  SOP / Finding / Rec chips shown at the top
//   - inlineTools:     tools that can appear inline under the day's tasks
//                      (based on keyword matches against the activity text)
//                      AND show on the standalone "Tools" tab.

import React from 'react';
import type { Stage, User } from '@/data/types';
import { GovernanceArtifactsTracker } from '@/components/stage1/tools/GovernanceArtifactsTracker';
import { TrainingVerification } from '@/components/stage1/tools/TrainingVerification';
import { HuddleLog } from '@/components/stage0/HuddleLog';
import { GenericLog } from './GenericLog';
import { useAppStore } from '@/store/useAppStore';

export interface ChipCfg {
  type: 'sop' | 'finding' | 'rec';
  id: string;
  label: string;
}

export interface InlineTool {
  key: string;
  title: string;
  hint: string;
  keywords: RegExp;
  render: (stage: Stage, canEdit: boolean, currentUser: User | null) => React.ReactNode;
}

export interface StageFlowConfig {
  referenceChips: ChipCfg[];
  inlineTools: InlineTool[];
}

// Shared factories -----------------------------------------------------------

const artifacts = (): InlineTool => ({
  key: 'artifacts',
  title: 'Governance Artifacts Tracker',
  hint: 'Every document this stage creates lives here. Flip each Draft → In Review → Signed/Posted as you go.',
  keywords:
    /charter|template|checklist|protocol|standard|catalog|glossary|form\b|map|rubric|policy|playbook|one.?pager|dashboard|packet|pack.?list|traveler|ladder|plan\b|baseline|matrix|register|backlog|definition|playbook|cadence/i,
  render: (stage, canEdit) => (
    <GovernanceArtifactsTracker
      stageId={stage.id}
      artifacts={stage.governanceArtifacts || []}
      canEdit={canEdit}
    />
  ),
});

const training = (): InlineTool => ({
  key: 'training',
  title: 'Training Verification',
  hint: 'Each lead demonstrates competence at their station on a live job. Verified one-to-one, not in a conference room.',
  keywords:
    /train(ing|ed|er)|walkthrough training|hands.?on|verified|demonstrate|demo |competenc|skill matrix|coach/i,
  render: (stage, canEdit) => (
    <TrainingVerification
      stageId={stage.id}
      rows={stage.trainingRows || []}
      canEdit={canEdit}
    />
  ),
});

const huddle = (): InlineTool => ({
  key: 'huddle',
  title: 'Daily Huddle Log',
  hint: 'Log today\'s huddle — plan, blockers, escalations. 10-minute cap, at the production board.',
  keywords: /huddle|stand.?up|daily meeting|10.?minute.*meet/i,
  render: (stage, canEdit, user) => {
    const addHuddleLog = useAppStore.getState().addHuddleLog;
    const deleteHuddleLog = useAppStore.getState().deleteHuddleLog;
    return (
      <HuddleLog
        logs={stage.huddleLogs || []}
        canEdit={canEdit}
        currentUserName={user?.name || 'User'}
        onAdd={(entry) => addHuddleLog(stage.id, entry)}
        onDelete={(entryId) => deleteHuddleLog(stage.id, entryId)}
      />
    );
  },
});

// Generic log factory --------------------------------------------------------

const log = (opts: {
  key: string;
  title: string;
  hint: string;
  keywords: RegExp;
  logKey: string;
  fields: any[];
  summaryText?: (entries: any[]) => string;
}): InlineTool => ({
  key: opts.key,
  title: opts.title,
  hint: opts.hint,
  keywords: opts.keywords,
  render: (stage, canEdit) => (
    <GenericLog
      stageId={stage.id}
      logKey={opts.logKey}
      title={undefined}
      hint={undefined}
      fields={opts.fields}
      canEdit={canEdit}
      entries={(stage.stageLogs || {})[opts.logKey] || []}
      summaryText={opts.summaryText}
    />
  ),
});

// STAGE 2 --------------------------------------------------------------------

const STAGE2: StageFlowConfig = {
  referenceChips: [
    { type: 'sop', id: 'SOP-03', label: 'SOP-03: Project Intake Checklist' },
    { type: 'sop', id: 'SOP-04', label: 'SOP-04: Readiness Gate Checklist' },
    { type: 'finding', id: 'B', label: 'Finding B: Demand planning reactive' },
    { type: 'finding', id: 'C', label: 'Finding C: Incomplete info after start' },
    { type: 'rec', id: '4.1', label: 'Rec 4.1: Project start preparation' },
    { type: 'rec', id: '4.2', label: 'Rec 4.2: Demand planning discipline' },
  ],
  inlineTools: [
    artifacts(),
    log({
      key: 'intake',
      title: 'Manufacturing Request Intake Log',
      hint: 'Every new plant request — including small standard-parts requests — logs here so demand is visible before it becomes urgent.',
      keywords: /intake|request.*(form|intake)|manufacturing request|new request|route.*(request|work)/i,
      logKey: 'intake',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'requester', label: 'Requester', type: 'text', required: true, width: 'w-40' },
        { key: 'jobRef', label: 'Job / DWG ref', type: 'text', width: 'w-40' },
        { key: 'kind', label: 'Kind', type: 'select', options: ['Standard', 'Custom', 'Prototype', 'Emergency'] },
        { key: 'state', label: 'Readiness', type: 'select', options: ['Not Ready', 'Ready for Planning', 'Ready for Release', 'Released'] },
        { key: 'missing', label: 'Missing info', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
      summaryText: (e) =>
        `${e.filter((x) => x.state === 'Released').length}/${e.length} released`,
    }),
    log({
      key: 'fuse',
      title: 'Cut-to-Fit ("Fuse") List',
      hint: 'Components intentionally over-length for on-site adjustment. Tracked with final-measurement accountability.',
      keywords: /fuse|cut.?to.?fit|oversize|trim.*on.?site|sur.?mesure|field measurement/i,
      logKey: 'fuse',
      fields: [
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-32' },
        { key: 'partId', label: 'Part ID', type: 'text', required: true, width: 'w-32' },
        { key: 'reason', label: 'Why cut-to-fit', type: 'text', required: true },
        { key: 'owner', label: 'Final-measurement owner', type: 'text' },
        { key: 'followUpTrigger', label: 'Follow-up trigger', type: 'text' },
        { key: 'closedOn', label: 'Closed on', type: 'date' },
      ],
    }),
    training(),
  ],
};

// STAGE 3 --------------------------------------------------------------------

const STAGE3: StageFlowConfig = {
  referenceChips: [
    { type: 'sop', id: 'SOP-39', label: 'SOP-39: Planning Cadence' },
    { type: 'sop', id: 'SOP-08', label: 'SOP-08: Standard Parts Cycle Times' },
    { type: 'sop', id: 'SOP-09', label: 'SOP-09: Consumption Model' },
    { type: 'finding', id: 'B', label: 'Finding B: Demand planning reactive' },
    { type: 'finding', id: 'H', label: 'Finding H: Standard parts under-leveraged' },
    { type: 'rec', id: '4.2', label: 'Rec 4.2: Demand planning discipline' },
    { type: 'rec', id: '4.7', label: 'Rec 4.7: Standard parts inventory' },
  ],
  inlineTools: [
    artifacts(),
    log({
      key: 'constraint',
      title: 'Constraint Log',
      hint: 'The true blockers: missing approvals, incomplete DWGs, unclear heights, missing degrees, material availability, site readiness.',
      keywords: /constraint|blocker|missing.*(approval|dwg|material|measurement|degree|dimension)|ready.but.not.released/i,
      logKey: 'constraint',
      fields: [
        { key: 'date', label: 'Date logged', type: 'date', required: true },
        { key: 'jobRef', label: 'Job / package', type: 'text', required: true, width: 'w-40' },
        { key: 'category', label: 'Category', type: 'select', options: ['Approval', 'DWG gap', 'Dimension / height', 'Material', 'Site readiness', 'Capacity', 'Other'], required: true },
        { key: 'detail', label: 'Detail', type: 'text', required: true },
        { key: 'owner', label: 'Owner to clear', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In progress', 'Cleared'] },
        { key: 'clearedOn', label: 'Cleared on', type: 'date' },
      ],
      summaryText: (e) => `${e.filter((x) => x.status === 'Open').length} open`,
    }),
    log({
      key: 'capacity',
      title: 'Weekly Capacity Review Log',
      hint: 'Plant Manager\'s weekly capacity review: available hours per operation, constraints, next-week commitments. Locked early in the week.',
      keywords: /capacity|weekly.*(plan|review|commit)|wip.?limit|frozen.?window|three.?lane/i,
      logKey: 'capacity',
      fields: [
        { key: 'weekOf', label: 'Week of', type: 'date', required: true },
        { key: 'operation', label: 'Operation', type: 'select', options: ['Laser', 'Folding', 'Welding', 'Finishing', 'Pack-out', 'Other'] },
        { key: 'availableHours', label: 'Available hrs', type: 'number', width: 'w-24' },
        { key: 'plannedHours', label: 'Planned hrs', type: 'number', width: 'w-24' },
        { key: 'expediteHours', label: 'Expedite hrs', type: 'number', width: 'w-24' },
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
    }),
    log({
      key: 'parts_catalog',
      title: 'Standard Parts Catalog + Cycle Times',
      hint: 'Repeatable parts master data: part code, key dimensions, material, cycle time by operation, typical consumption.',
      keywords: /standard part|rails?\b|om[eé]ga|lisse|parts catalog|cycle time|consumption|min.?max|make.?to.?stock/i,
      logKey: 'parts_catalog',
      fields: [
        { key: 'partCode', label: 'Part code', type: 'text', required: true, width: 'w-28' },
        { key: 'name', label: 'Name / description', type: 'text', required: true },
        { key: 'material', label: 'Material', type: 'text', width: 'w-28' },
        { key: 'cycleLaser', label: 'Laser (min)', type: 'number', width: 'w-20' },
        { key: 'cycleFold', label: 'Fold (min)', type: 'number', width: 'w-20' },
        { key: 'cycleWeld', label: 'Weld (min)', type: 'number', width: 'w-20' },
        { key: 'cycleFinish', label: 'Finish (min)', type: 'number', width: 'w-20' },
        { key: 'minStock', label: 'Min', type: 'number', width: 'w-16' },
        { key: 'maxStock', label: 'Max', type: 'number', width: 'w-16' },
      ],
    }),
    training(),
    huddle(),
  ],
};

// STAGE 4 --------------------------------------------------------------------

const STAGE4: StageFlowConfig = {
  referenceChips: [
    { type: 'sop', id: 'SOP-18', label: 'SOP-18: WOP Creation & Release' },
    { type: 'sop', id: 'SOP-19', label: 'SOP-19: Revision Control' },
    { type: 'sop', id: 'SOP-20', label: 'SOP-20: Traveler & Station Signoff' },
    { type: 'finding', id: 'C', label: 'Finding C: Incomplete info after start' },
    { type: 'rec', id: '4.1', label: 'Rec 4.1: Project start preparation' },
    { type: 'rec', id: '4.4', label: 'Rec 4.4: WOP + revision control' },
  ],
  inlineTools: [
    artifacts(),
    log({
      key: 'release',
      title: 'Release-to-Production Log',
      hint: 'Every release to production: job, revision, item list, due date, signoffs. The floor does not build from anything that isn\'t logged here.',
      keywords: /release.*(production|to.?plant)|revision.*(release|approved)|job packet release|wop release|first.?of.?series|prototype release/i,
      logKey: 'release',
      fields: [
        { key: 'date', label: 'Release date', type: 'date', required: true },
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-32' },
        { key: 'revision', label: 'Revision', type: 'text', required: true, width: 'w-24' },
        { key: 'scope', label: 'Scope / item list', type: 'text', required: true },
        { key: 'dueDate', label: 'Due date', type: 'date' },
        { key: 'signoffs', label: 'Signoffs (Site/Design/Plant)', type: 'text' },
        { key: 'kind', label: 'Kind', type: 'select', options: ['Full release', 'Partial (standard only)', 'Re-release', 'Prototype'] },
      ],
      summaryText: (e) =>
        `${e.filter((x) => x.kind === 'Re-release').length} re-releases`,
    }),
    log({
      key: 'revision',
      title: 'Revision Change Notice Log',
      hint: 'Post-release changes: what changed, why, disposition of in-progress work (use-as-is / rework / scrap).',
      keywords: /revision change|re.?release|wop change|disposition|use.?as.?is|scrap|rework.*(revision|change)/i,
      logKey: 'revision',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-28' },
        { key: 'fromRev', label: 'From rev', type: 'text', width: 'w-20' },
        { key: 'toRev', label: 'To rev', type: 'text', width: 'w-20' },
        { key: 'whatChanged', label: 'What changed', type: 'text', required: true },
        { key: 'why', label: 'Why', type: 'text' },
        { key: 'disposition', label: 'Disposition', type: 'select', options: ['Use as is', 'Rework', 'Scrap', 'Continue'] },
        { key: 'approver', label: 'Approver', type: 'text' },
      ],
    }),
    log({
      key: 'wip',
      title: 'WIP Age Tracker',
      hint: 'WIP age by operation — predicts late shipments earlier than end-of-week status reports (Rec 4.6 leading indicator).',
      keywords: /wip|work.in.progress|operation.*age|handoff|station signoff/i,
      logKey: 'wip',
      fields: [
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-28' },
        { key: 'operation', label: 'Operation', type: 'select', options: ['Laser', 'Folding', 'Welding', 'Finishing', 'Pack-out'] },
        { key: 'enteredOn', label: 'Entered', type: 'date', required: true },
        { key: 'dueDate', label: 'Due', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['In queue', 'In progress', 'Blocked', 'Done'] },
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
    }),
    training(),
  ],
};

// STAGE 5 --------------------------------------------------------------------

const STAGE5: StageFlowConfig = {
  referenceChips: [
    { type: 'sop', id: 'SOP-14', label: 'SOP-14: CTQ & First-Article' },
    { type: 'sop', id: 'SOP-15', label: 'SOP-15: In-Process QC Checks' },
    { type: 'sop', id: 'SOP-16', label: 'SOP-16: NCR / Rework Loop' },
    { type: 'sop', id: 'SOP-20', label: 'SOP-20: Traveler Signoff' },
    { type: 'finding', id: 'A', label: 'Finding A: QC missing' },
    { type: 'rec', id: '4.3', label: 'Rec 4.3: QC baseline' },
    { type: 'rec', id: '4.4', label: 'Rec 4.4: WOP (feedback loop)' },
  ],
  inlineTools: [
    artifacts(),
    log({
      key: 'ncr',
      title: 'Nonconformance (NCR) Log',
      hint: 'Every tagged defect. Tied to job + operation + root-cause category. Fuels weekly QC review and upstream standards updates.',
      keywords: /nonconform|ncr|defect|rework|stop.*contain|quarantine|suspect part|critical defect/i,
      logKey: 'ncr',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-28' },
        { key: 'operation', label: 'Operation', type: 'select', options: ['Laser', 'Folding', 'Welding', 'Finishing', 'Pack-out', 'Incoming', 'Other'] },
        { key: 'defectCode', label: 'Defect code', type: 'select', options: ['Wrong revision', 'Missing dim', 'Wrong part ID', 'Fold dir/angle', 'Missing item', 'Finish defect', 'Weld defect', 'Label error', 'Other'] },
        { key: 'detectedBy', label: 'Detected by', type: 'text', width: 'w-28' },
        { key: 'stage', label: 'Caught when', type: 'select', options: ['Before shipment', 'On site'] },
        { key: 'containment', label: 'Containment action', type: 'text', required: true },
        { key: 'disposition', label: 'Disposition', type: 'select', options: ['Use as is', 'Rework', 'Scrap'] },
        { key: 'reworkMins', label: 'Rework (min)', type: 'number', width: 'w-24' },
        { key: 'rootCause', label: 'Root cause category', type: 'select', options: ['Design gap', 'Site change', 'Labeling', 'Fabrication error', 'Supplier', 'Other'] },
      ],
      summaryText: (e) => {
        const shipped = e.filter((x) => x.stage === 'On site').length;
        return `${shipped} caught on site`;
      },
    }),
    log({
      key: 'first_article',
      title: 'First-Article Verification Log',
      hint: 'One per new or changed work package. Validates fit, labeling, pack-out BEFORE series production.',
      keywords: /first.?article|first.?of.?series|first.?in.?place|first run|ctq|prototype.*(verify|validate|lock)/i,
      logKey: 'first_article',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-28' },
        { key: 'packageType', label: 'Work package type', type: 'text' },
        { key: 'ctqResult', label: 'CTQ check', type: 'select', options: ['Pass', 'Fail', 'Conditional'] },
        { key: 'issuesFound', label: 'Issues found', type: 'text' },
        { key: 'standardsUpdated', label: 'Standards updated?', type: 'checkbox' },
        { key: 'signedBy', label: 'Signed by', type: 'text' },
      ],
    }),
    log({
      key: 'qc_review',
      title: 'Weekly QC Review',
      hint: '20-minute weekly review: top 3 defects, one concrete countermeasure per defect, verify standards actually updated.',
      keywords: /weekly qc|qc review|top.?3|pareto|corrective action|countermeasure|feedback loop/i,
      logKey: 'qc_review',
      fields: [
        { key: 'weekOf', label: 'Week of', type: 'date', required: true },
        { key: 'top1Code', label: 'Top defect 1', type: 'text' },
        { key: 'top1Action', label: 'Countermeasure', type: 'text' },
        { key: 'top2Code', label: 'Top defect 2', type: 'text' },
        { key: 'top2Action', label: 'Countermeasure', type: 'text' },
        { key: 'top3Code', label: 'Top defect 3', type: 'text' },
        { key: 'top3Action', label: 'Countermeasure', type: 'text' },
        { key: 'standardsUpdated', label: 'Standards updated this week?', type: 'checkbox' },
      ],
    }),
    training(),
    huddle(),
  ],
};

// STAGE 6 --------------------------------------------------------------------

const STAGE6: StageFlowConfig = {
  referenceChips: [
    { type: 'sop', id: 'SOP-17', label: 'SOP-17: Site Fit-up / Sur-Mesure' },
    { type: 'sop', id: 'SOP-21', label: 'SOP-21: Punch List & Closeout' },
    { type: 'sop', id: 'SOP-22', label: 'SOP-22: Shipment Readiness' },
    { type: 'finding', id: 'C', label: 'Finding C: Incomplete info after start' },
    { type: 'rec', id: '4.1', label: 'Rec 4.1: Project close-out' },
    { type: 'rec', id: '4.4', label: 'Rec 4.4: Labeling / kitting' },
    { type: 'rec', id: '4.6', label: 'Rec 4.6: Dashboard for site' },
  ],
  inlineTools: [
    artifacts(),
    log({
      key: 'field_adjustment',
      title: 'Field Adjustment Request Log',
      hint: 'Structured requests from site: photos, measurements, piece ID, due need date. The plant can act without re-interpreting notes.',
      keywords: /field adjustment|sur.?mesure|site.*(request|measurement|adjustment)|photos.*(site|install|field)/i,
      logKey: 'field_adjustment',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-28' },
        { key: 'moduleTerrace', label: 'Module / terrace', type: 'text' },
        { key: 'pieceId', label: 'Piece ID', type: 'text', width: 'w-28' },
        { key: 'kind', label: 'Kind', type: 'select', options: ['Cut-to-fit (planned fuse)', 'New variance', 'Quality defect', 'Install issue'] },
        { key: 'description', label: 'Description (dimensions, photos elsewhere)', type: 'text', required: true },
        { key: 'dueBy', label: 'Need by', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In plant', 'Shipped', 'Installed', 'Closed'] },
      ],
      summaryText: (e) => `${e.filter((x) => x.status === 'Open').length} open`,
    }),
    log({
      key: 'shipment',
      title: 'Shipment Readiness Log',
      hint: 'Every shipment: counted, labels verified, pallet photographed, pack list attached. No pallet leaves without this row.',
      keywords: /pack.?out|pack list|shipment|pallet|label verif|shipment readiness|photograph.*(pallet|ship)/i,
      logKey: 'shipment',
      fields: [
        { key: 'shipDate', label: 'Ship date', type: 'date', required: true },
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-28' },
        { key: 'pallets', label: 'Pallets', type: 'number', width: 'w-16' },
        { key: 'packListAttached', label: 'Pack list attached', type: 'checkbox' },
        { key: 'labelsVerified', label: 'Labels verified', type: 'checkbox' },
        { key: 'photosStored', label: 'Pallet photos stored', type: 'checkbox' },
        { key: 'signedBy', label: 'Signed by', type: 'text' },
      ],
    }),
    log({
      key: 'closeout',
      title: 'Closeout Lessons Log',
      hint: 'What recurred on this job that should change a template or standard. Route updates to the governance owner.',
      keywords: /closeout|close.?out|lessons learned|punch list|recurring issue|update.*(template|standard)/i,
      logKey: 'closeout',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'jobId', label: 'Job', type: 'text', required: true, width: 'w-28' },
        { key: 'issue', label: 'Recurring issue', type: 'text', required: true },
        { key: 'rootCause', label: 'Root cause', type: 'text' },
        { key: 'templateToUpdate', label: 'Template / standard to update', type: 'text' },
        { key: 'owner', label: 'Update owner', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Proposed', 'In progress', 'Updated', 'Closed'] },
      ],
    }),
    training(),
  ],
};

// STAGE 7 --------------------------------------------------------------------

const STAGE7: StageFlowConfig = {
  referenceChips: [
    { type: 'sop', id: 'SOP-25', label: 'SOP-25: Accountability Rules' },
    { type: 'sop', id: 'SOP-28', label: 'SOP-28: Training-in-the-Work' },
    { type: 'sop', id: 'SOP-29', label: 'SOP-29: Layered Process Audits' },
    { type: 'finding', id: 'A', label: 'Finding A: QC missing (sustain)' },
    { type: 'finding', id: 'G', label: 'Finding G: No single dashboard' },
    { type: 'rec', id: '4.0', label: 'Rec 4.0: Guiding Principles' },
    { type: 'rec', id: '4.6', label: 'Rec 4.6: Operational Dashboard' },
  ],
  inlineTools: [
    artifacts(),
    log({
      key: 'lpa',
      title: 'Layered Process Audit (LPA) Log',
      hint: 'Leaders at every layer walk the floor against the published checklist. Gaps become coaching, not ambush.',
      keywords: /layered.*(audit|process)|\blpa\b|audit.*(checklist|compliance)|coaching|walk the floor|adherence/i,
      logKey: 'lpa',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'auditor', label: 'Auditor', type: 'text', required: true, width: 'w-32' },
        { key: 'layer', label: 'Layer', type: 'select', options: ['Team lead', 'Plant Manager', 'CEO / governance'] },
        { key: 'area', label: 'Area / line', type: 'text' },
        { key: 'score', label: 'Score (0-5)', type: 'number', width: 'w-20' },
        { key: 'findings', label: 'Findings', type: 'text' },
        { key: 'correctiveAction', label: 'Corrective action', type: 'text' },
        { key: 'owner', label: 'CA owner', type: 'text' },
      ],
    }),
    log({
      key: 'exceptions',
      title: 'Exceptions / No-Bypass Log',
      hint: 'Every time a "no bypass" rule is bypassed, log it here with reason + approver. Weekly review catches patterns.',
      keywords: /bypass|exception|no.?bypass|accountability|skip.*(gate|check)|ignore.*(rule|sop)/i,
      logKey: 'exceptions',
      fields: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'rule', label: 'Rule bypassed', type: 'text', required: true },
        { key: 'reason', label: 'Reason', type: 'text', required: true },
        { key: 'approver', label: 'Approver', type: 'text' },
        { key: 'correctiveAction', label: 'Corrective action', type: 'text' },
        { key: 'reviewed', label: 'Reviewed in weekly cadence', type: 'checkbox' },
      ],
    }),
    log({
      key: 'improvement',
      title: 'Improvement Backlog',
      hint: 'Tied to the highest cost drivers and recurring site issues. The governance-owner queue for making the system better.',
      keywords: /improvement|backlog|countermeasure|kaizen|continuous improvement|systemic/i,
      logKey: 'improvement',
      fields: [
        { key: 'added', label: 'Added', type: 'date', required: true },
        { key: 'title', label: 'Improvement', type: 'text', required: true },
        { key: 'costDriver', label: 'Cost driver / recurring issue', type: 'text' },
        { key: 'owner', label: 'Owner', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
        { key: 'status', label: 'Status', type: 'select', options: ['Proposed', 'In progress', 'Done', 'Parked'] },
      ],
      summaryText: (e) =>
        `${e.filter((x) => x.status === 'Done').length}/${e.length} done`,
    }),
    log({
      key: 'kpi',
      title: 'KPI Dashboard Log',
      hint: 'Weekly KPI snapshot: on-time ship, rework %, first-pass yield, missing parts, plan stability. The one-screen daily view.',
      keywords: /kpi|dashboard|on.?time|first.?pass yield|plan stability|missing part|metric/i,
      logKey: 'kpi',
      fields: [
        { key: 'weekOf', label: 'Week of', type: 'date', required: true },
        { key: 'onTimePct', label: 'On-time ship %', type: 'number', width: 'w-24' },
        { key: 'reworkPct', label: 'Rework %', type: 'number', width: 'w-24' },
        { key: 'fpyPct', label: 'First-pass yield %', type: 'number', width: 'w-24' },
        { key: 'missingParts', label: 'Missing-part events', type: 'number', width: 'w-24' },
        { key: 'planStabilityPct', label: 'Plan stability %', type: 'number', width: 'w-24' },
        { key: 'notes', label: 'Notes / actions', type: 'text' },
      ],
    }),
    training(),
    huddle(),
  ],
};

// --------------------------------------------------------------------------

export const STAGE_FLOW_CONFIGS: Record<string, StageFlowConfig> = {
  stage2: STAGE2,
  stage3: STAGE3,
  stage4: STAGE4,
  stage5: STAGE5,
  stage6: STAGE6,
  stage7: STAGE7,
};
