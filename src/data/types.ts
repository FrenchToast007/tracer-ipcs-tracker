// Activity status
export type ActivityStatus = 'pending' | 'in_progress' | 'done' | 'blocked';

// Stage status
export type StageStatus = 'locked' | 'active' | 'complete';

// 5S Step
export type FiveStep = 'sort' | 'setInOrder' | 'shine' | 'standardize' | 'sustain' | null;

// Priority levels
export type Priority = 'low' | 'medium' | 'high';

// Tag priority
export type TagPriority = 'S' | 'M' | 'L';

// Red tag disposition
export type RedTagDisposition = 'pending' | 'discard' | 'relocate' | 'store';

// User roles
export type UserRole = 'plantManager' | 'ceo' | 'cfo' | 'projectManager' | 'siteManager' | 'consultant';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Activity {
  id: string;
  day: string;
  time?: string;
  description: string;
  owner: string;
  deliverable?: string;
  status: ActivityStatus;
  notes: string;
  isBlitz?: boolean;
  fiveStep?: FiveStep;
  completedAt?: string;
  // New fields for extreme-detail activities
  detailSteps?: string[];
  duration?: number;
  location?: string;
  successLooksLike?: string;
  commonMistakes?: string[];
  dependencies?: string[];
  relatedZones?: string[];
  relatedSupplies?: string[];
  sopRefs?: string[];
  findingRefs?: string[];
  recRefs?: string[];
  kpiRefs?: string[];
  wasteRefs?: string[];
}

export interface WeekReviewData {
  submitted: boolean;
  kpiValues?: Record<string, number>;
  notes?: string;
  submittedAt?: string;
  submittedBy?: string;
}

export interface Week {
  id: string;
  number: number;
  theme: string;
  focus: string;
  status: 'locked' | 'active' | 'complete';
  productionImpact?: string;
  dailyNonNegotiables?: string[];
  activities: Activity[];
  reviewData?: WeekReviewData;
}

export interface KPI {
  id: string;
  name: string;
  unit: string;
  baseline: number;
  target: number;
  higherIsBetter: boolean;
  weeklyValues: {
    week1?: number;
    week2?: number;
    week3?: number;
    week4?: number;
  };
}

export interface ExitCriterion {
  id: string;
  description: string;
  met: boolean;
  notes?: string;
  evidenceRequired?: string;
  targetDate?: string;
}

export interface PlantZone {
  id: string;
  letter: string;
  name: string;
  description?: string;
  keyContents: string[];
  teamLead: string;
}

export interface FiveSScores {
  sort: number;
  setInOrder: number;
  shine: number;
  standardize: number;
  sustain: number;
  notes?: string;
}

export interface FiveSZone {
  id: string;
  name: string;
  weeklyScores: {
    baseline?: FiveSScores;
    week2?: FiveSScores;
    week3?: FiveSScores;
    week4?: FiveSScores;
  };
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  zone?: string;
  takenAt: string;
  tags?: string[];
}

export interface RedTagItem {
  id: string;
  zone: string;
  item: string;
  reason: string;
  disposition: RedTagDisposition;
  taggedAt: string;
  disposedAt?: string;
}

export interface MaintenanceTag {
  id: string;
  zone: string;
  location: string;
  description: string;
  priority: TagPriority;
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface HuddleLogEntry {
  id: string;
  date: string;
  week: number;
  facilitator: string;
  safety: string;
  yesterday: string;
  today: string;
  problems: string;
  helpNeeded: string;
  shoutout: string;
}

export interface SupplyItem {
  id: string;
  item: string;
  quantity: number;
  neededBy: string;
  ordered: boolean;
  acquired: boolean;
}

export interface RoleEntry {
  role: string;
  person: string;
  responsibilities: string[];
}

export interface RiskItem {
  risk: string;
  mitigation: string;
  owner: string;
}

export interface AuditFindingConnection {
  finding: string;
  connection: string;
  stageRelevance: string;
}

export interface Note {
  id: string;
  stageId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  priority: Priority;
  createdAt: string;
}

// ----- Stage 1 tool/sheet types -----

export type ArtifactStatus = 'not_started' | 'draft' | 'in_review' | 'signed' | 'posted';

export interface GovernanceArtifact {
  id: string;
  name: string;          // e.g. "Tracer Execution Control Charter"
  owner: string;         // role or person
  status: ArtifactStatus;
  version: string;       // e.g. "v0.1", "v1.0"
  link?: string;         // optional URL (e.g. Basecamp link)
  notes?: string;
  updatedAt?: string;
}

export type RaciValue = '' | 'R' | 'A' | 'C' | 'I';

export interface RaciRow {
  id: string;
  decision: string;              // e.g. "Release to Production"
  values: Record<string, RaciValue>; // column key (role) -> R/A/C/I
  notes?: string;
}

export type PriorityTier = 'P1' | 'P2' | 'P3';
export type PriorityLogKind = 'priority_change' | 'escalation' | 'stop_the_line' | 'urgent_request';
export type PriorityLogOutcome = 'resolved' | 'escalated' | 'rejected' | 'pending';

export interface PriorityLogEntry {
  id: string;
  date: string;                  // ISO
  kind: PriorityLogKind;
  requester: string;
  tier?: PriorityTier;
  justification: string;
  approver?: string;
  outcome: PriorityLogOutcome;
  resolutionTimeMinutes?: number;
  notes?: string;
}

export interface CeoInterventionEntry {
  id: string;
  date: string;                  // ISO
  override: string;              // short description of what was changed
  rationale: string;
  downstreamImpact: string;      // jobs shifted, commitments slipped, etc
  followUpAction: string;
  followUpOwner: string;
}

export interface ComplianceRow {
  id: string;
  projectName: string;
  jobIdApplied: boolean;        // naming convention
  mandatoryFields: boolean;     // owner/site contact/job type/delivery event/latest rev/open risks/approval state/priority tier
  filedCorrectly: boolean;      // documents filed in standard folder structure
  latestRevisionVisible: boolean;
  notes?: string;
  checkedAt?: string;
}

export interface TrainingRow {
  id: string;
  leadName: string;              // e.g. "Plant Manager — Abdel Benali"
  sessionDate?: string;
  liveJobUsed?: string;          // the real job used for the hands-on walkthrough
  demonstratedLocate: boolean;   // can locate a live job record
  demonstratedUpdate: boolean;   // can update a live job record
  demonstratedEscalate: boolean; // can walk an escalation up the ladder
  verifiedBy?: string;           // Consultant name
  notes?: string;
}

export interface FindAJobEntry {
  id: string;
  participantName: string;
  role?: string;
  jobQueried?: string;
  seconds?: number;              // how long it took them to find the plan
  passed?: boolean;
}

export interface Stage {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  description: string;
  purpose: string;
  status: StageStatus;
  color: string;
  completionPercent: number;
  weeks: Week[];
  kpis: KPI[];
  exitCriteria: ExitCriterion[];
  plantZones?: PlantZone[];
  fiveSZones?: FiveSZone[];
  photos?: Photo[];
  redTags?: RedTagItem[];
  maintenanceTags?: MaintenanceTag[];
  huddleLogs?: HuddleLogEntry[];
  supplies?: SupplyItem[];
  // Stage 1 tools / sheets
  governanceArtifacts?: GovernanceArtifact[];
  raciRows?: RaciRow[];
  raciColumns?: string[];           // column headers for the RACI matrix (role names)
  priorityLog?: PriorityLogEntry[];
  ceoInterventionLog?: CeoInterventionEntry[];
  complianceRows?: ComplianceRow[];
  trainingRows?: TrainingRow[];
  findAJobEntries?: FindAJobEntry[];
  // Shared
  guidingPrinciples?: string[];
  roles?: RoleEntry[];
  risks?: RiskItem[];
  auditFindings?: AuditFindingConnection[];
  signedOffAt?: string;
  signedOffBy?: string;
}

export interface AppState {
  currentUser: User | null;
  stages: Stage[];
  notes: Note[];
}
