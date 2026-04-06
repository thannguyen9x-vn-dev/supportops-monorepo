import {
  AssetStatus,
  CommentVisibility,
  MembershipStatus,
  PrismaClient,
  RequestActivityType,
  RequestImpactLevel,
  RequestPriority,
  RequestStatus,
  RequestUrgency,
  Role,
  SlaHealth,
  SlaType,
  SourceChannel,
  TenantStatus,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEMO_EMAIL_DOMAIN = process.env.SEED_DEMO_EMAIL_DOMAIN ?? 'supportops.dev';
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'SupportOps@123';

function toDemoEmail(localPart: string): string {
  return `${localPart}@${DEMO_EMAIL_DOMAIN}`;
}

const roles: Array<{ code: string; name: string; description: string }> = [
  { code: 'EMPLOYEE', name: 'Employee', description: 'Requester role with own-request visibility.' },
  {
    code: 'OPS_COORDINATOR',
    name: 'Ops Coordinator',
    description: 'Coordinates assignments and request processing across tenant queue.',
  },
  { code: 'TECHNICIAN', name: 'Technician', description: 'Executes assigned work and internal updates.' },
  { code: 'TENANT_ADMIN', name: 'Tenant Admin', description: 'Full tenant administration and governance.' },
];

const permissions: Array<{ code: string; description: string }> = [
  { code: 'request.create', description: 'Create service requests.' },
  { code: 'request.read.own', description: 'Read own service requests.' },
  { code: 'request.read.all', description: 'Read all service requests in tenant.' },
  { code: 'request.assign', description: 'Assign request to a technician.' },
  { code: 'request.reassign', description: 'Reassign request owner.' },
  { code: 'request.resolve', description: 'Resolve service requests.' },
  { code: 'request.close', description: 'Close service requests.' },
  { code: 'request.reopen', description: 'Reopen closed service requests.' },
  { code: 'request.escalate', description: 'Escalate requests.' },
  { code: 'request.start_work', description: 'Start work on assigned requests.' },
  { code: 'request.update.metadata', description: 'Update request metadata and routing fields.' },
  { code: 'comment.create.public', description: 'Create public comments.' },
  { code: 'comment.create.internal', description: 'Create internal notes.' },
  { code: 'comment.read.internal', description: 'Read internal notes.' },
  { code: 'workflow.manage', description: 'Manage workflow configuration.' },
  { code: 'sla.manage', description: 'Manage SLA policies.' },
  { code: 'user.invite', description: 'Invite users into tenant.' },
  { code: 'user.deactivate', description: 'Deactivate tenant users.' },
  { code: 'role.manage', description: 'Change membership roles.' },
  { code: 'audit.read', description: 'Read audit logs.' },
  { code: 'asset.manage', description: 'Create, update and delete assets and asset types.' },
  { code: 'report.read', description: 'Read reporting and analytics data.' },
  { code: 'ai.ask', description: 'Use AI assistant to query operational data.' },
];

const rolePermissionMap: Record<string, string[]> = {
  EMPLOYEE: ['request.create', 'request.read.own', 'comment.create.public', 'request.close', 'request.reopen'],
  OPS_COORDINATOR: [
    'request.create',
    'request.read.own',
    'comment.create.public',
    'request.close',
    'request.reopen',
    'request.read.all',
    'request.assign',
    'request.reassign',
    'request.resolve',
    'request.escalate',
    'request.update.metadata',
    'comment.create.internal',
    'comment.read.internal',
    'audit.read',
  ],
  TECHNICIAN: [
    'request.read.own',
    'request.start_work',
    'request.resolve',
    'comment.create.public',
    'comment.create.internal',
    'comment.read.internal',
  ],
  TENANT_ADMIN: permissions.map((permission) => permission.code),
};

type DemoAccountKey =
  | 'admin'
  | 'coordinator_1'
  | 'coordinator_2'
  | 'technician_1'
  | 'technician_2'
  | 'technician_3'
  | 'employee_1'
  | 'employee_2';

type DemoAccount = {
  key: DemoAccountKey;
  email: string;
  firstName: string;
  lastName: string;
  roleCode: 'TENANT_ADMIN' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'EMPLOYEE';
  legacyRole: Role;
  department: string;
};

const demoAccounts: DemoAccount[] = [
  {
    key: 'admin',
    email: toDemoEmail('sarah.chen'),
    firstName: 'Sarah',
    lastName: 'Chen',
    roleCode: 'TENANT_ADMIN',
    legacyRole: Role.SUPER_ADMIN,
    department: 'Operations Leadership',
  },
  {
    key: 'coordinator_1',
    email: toDemoEmail('marcus.rivera'),
    firstName: 'Marcus',
    lastName: 'Rivera',
    roleCode: 'OPS_COORDINATOR',
    legacyRole: Role.ADMIN,
    department: 'Service Operations',
  },
  {
    key: 'coordinator_2',
    email: toDemoEmail('jamie.wong'),
    firstName: 'Jamie',
    lastName: 'Wong',
    roleCode: 'OPS_COORDINATOR',
    legacyRole: Role.ADMIN,
    department: 'Service Operations',
  },
  {
    key: 'technician_1',
    email: toDemoEmail('jordan.kim'),
    firstName: 'Jordan',
    lastName: 'Kim',
    roleCode: 'TECHNICIAN',
    legacyRole: Role.MEMBER,
    department: 'Facilities',
  },
  {
    key: 'technician_2',
    email: toDemoEmail('alex.pham'),
    firstName: 'Alex',
    lastName: 'Pham',
    roleCode: 'TECHNICIAN',
    legacyRole: Role.MEMBER,
    department: 'IT Operations',
  },
  {
    key: 'technician_3',
    email: toDemoEmail('priya.nair'),
    firstName: 'Priya',
    lastName: 'Nair',
    roleCode: 'TECHNICIAN',
    legacyRole: Role.MEMBER,
    department: 'Facilities',
  },
  {
    key: 'employee_1',
    email: toDemoEmail('oliver.davis'),
    firstName: 'Oliver',
    lastName: 'Davis',
    roleCode: 'EMPLOYEE',
    legacyRole: Role.MEMBER,
    department: 'Product',
  },
  {
    key: 'employee_2',
    email: toDemoEmail('linh.tran'),
    firstName: 'Linh',
    lastName: 'Tran',
    roleCode: 'EMPLOYEE',
    legacyRole: Role.MEMBER,
    department: 'Finance',
  },
];

// ─── Comment & Work Log Templates ─────────────────────────────────────────────
// Picked per-request by (index % length) so content varies across requests.

const publicCommentTemplates: Record<string, string[]> = {
  HVAC: [
    'Technician has inspected the unit and confirmed the fault. Replacement parts have been sourced.',
    'Root cause identified as a failed contactor relay. Component replaced and cooling cycle verified.',
    'Filter and evaporator coil cleaned. Airflow restored. Temperature being monitored for stability.',
  ],
  ELECTRICAL: [
    'Fault isolated to a single circuit breaker. Safe to use all other circuits in the meantime.',
    'Replacement components installed and load-tested. All circuits verified operational.',
    'Cable fault repaired and insulation integrity confirmed. Panel signed off for normal use.',
  ],
  PLUMBING: [
    'Leak located at a compression joint. Area has been isolated and repair is underway.',
    'Blockage cleared using hydro-jet. Flow rate restored and drain tested under full load.',
    'Supply valve repaired and pressure normalised. No further leaks detected after 30-minute soak test.',
  ],
  IT_SUPPORT: [
    'Issue reproduced in staging. Root cause under investigation — update will follow within 2 hours.',
    'Patch applied and services restarted. Monitoring system stability over the next hour.',
    'Hardware replaced and end-to-end validation completed. Ticket will close after 24-hour observation.',
  ],
  GENERAL_MAINTENANCE: [
    'On-site inspection completed. Parts ordered and repair scheduled for next available window.',
    'Repair completed and functionality verified. Area cleared and safe for normal use.',
    'Temporary fix applied pending full component replacement. Safety signage in place.',
  ],
};

const internalNoteTemplates: Record<string, string[]> = {
  HVAC: [
    'Compressor efficiency at 82% — below spec. Flag for scheduled replacement in Q3 before peak cooling season.',
    'Refrigerant charge was 18% low, likely a slow leak. Recommend leak detection inspection this week.',
  ],
  ELECTRICAL: [
    'Panel shows visible signs of age-related wear on bus bars. Recommend full audit at next maintenance window.',
    'Cable insulation degraded in section B3. Full rewire of that run should be planned before end of quarter.',
  ],
  PLUMBING: [
    'Pipe joint shows early corrosion. Schedule monthly checks — section replacement likely needed within 6 months.',
    'Pressure fluctuation noted on building main during repair. Coordinate with facilities lead for further investigation.',
  ],
  IT_SUPPORT: [
    "Issue may be related to last week's AD group policy push. Checking correlation with infra team.",
    'Third ticket of this type in 30 days — flagging for root cause analysis session with the IT lead.',
  ],
  GENERAL_MAINTENANCE: [
    'Second report from this location in 60 days. May indicate systemic issue — escalate to facilities manager.',
    'Contractor availability confirmed for next Tuesday. Work is blocked until then.',
  ],
};

const workLogContentTemplates: Record<string, string[]> = {
  HVAC: [
    'Inspected unit, cleaned filters and coils, topped up refrigerant, and verified temperature setpoints meet spec.',
    'Replaced faulty contactor and run capacitor. Tested full cooling cycle — unit operating within rated parameters.',
    'Full diagnostic completed: refrigerant charge, airflow, and electrical connections all within acceptable range.',
  ],
  ELECTRICAL: [
    'Isolated fault, replaced failed breaker, and verified load balance across all circuits on the affected panel.',
    'Replaced ballast and lamp assemblies. Tested emergency lighting activation sequence — all units passed.',
    'Conducted continuity and earth bond testing. Repaired damaged cable runs and restored panel to service.',
  ],
  PLUMBING: [
    'Isolated supply valve, replaced compression fitting, and pressure-tested the repaired section — no leaks.',
    'Cleared blockage with hydro-jet, applied descaler, and retested flow rate at full operating pressure.',
    'Replaced worn washer seals and tightened all joints. No leaks detected after 30-minute pressurised soak test.',
  ],
  IT_SUPPORT: [
    'Reimaged workstation, rejoined domain, installed required software suite, and validated all user access rights.',
    'Diagnosed network fault via packet capture. Replaced faulty switch module and confirmed stable throughput.',
    'Applied security patch, restarted affected services, and ran full end-to-end validation — all systems green.',
  ],
  GENERAL_MAINTENANCE: [
    'Disassembled faulty mechanism, replaced worn components, and completed post-repair operational test.',
    'Completed inspection and carried out scheduled preventive maintenance tasks per the facilities schedule.',
    'Repaired damaged fixture and verified compliance with safety standards. Area signed off for normal use.',
  ],
};

const workLogMinutesByPriority: Record<RequestPriority, number> = {
  [RequestPriority.LOW]: 35,
  [RequestPriority.MEDIUM]: 60,
  [RequestPriority.HIGH]: 90,
  [RequestPriority.URGENT]: 135,
};

// ─── Request Definitions ──────────────────────────────────────────────────────

type DemoRequestSeed = {
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  serviceTypeCode: 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'IT_SUPPORT' | 'GENERAL_MAINTENANCE';
  requester: DemoAccountKey;
  assignee?: DemoAccountKey;
  locationId: string;
  assetCode?: string;
  impactLevel: RequestImpactLevel;
  urgency: RequestUrgency;
  slaHealth: SlaHealth;
  hoursAgo: number;
  sourceChannel?: SourceChannel;
  hasPublicComment?: boolean;
  hasInternalNote?: boolean;
  hasWorkLog?: boolean;
  escalated?: boolean;
};

const demoRequests: DemoRequestSeed[] = [
  // ── Active pipeline (days 1–7) ────────────────────────────────────────────
  { title: 'Printer queue blocked on 5th floor', description: 'Shared printer hangs after receiving large PDF jobs.', status: RequestStatus.SUBMITTED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_1', locationId: 'HQ-5F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 160, sourceChannel: SourceChannel.WEB },
  { title: 'Main lobby AC not cooling', description: 'Front desk reported room temperature above 29°C since morning.', status: RequestStatus.SUBMITTED, priority: RequestPriority.HIGH, serviceTypeCode: 'HVAC', requester: 'employee_2', locationId: 'HQ-LOBBY', assetCode: 'HVAC-HQ-001', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 154, sourceChannel: SourceChannel.PHONE },
  { title: 'Network packet loss in meeting room B', description: 'Video calls are unstable during board-level meetings.', status: RequestStatus.SUBMITTED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'coordinator_2', locationId: 'HQ-3F-B', assetCode: 'NET-HQ-002', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 148, sourceChannel: SourceChannel.EMAIL },
  { title: 'Water leak under pantry sink', description: 'Standing water found near the pantry cabinet on the 2nd floor.', status: RequestStatus.TRIAGE, priority: RequestPriority.HIGH, serviceTypeCode: 'PLUMBING', requester: 'employee_1', assignee: 'coordinator_1', locationId: 'HQ-2F-PANTRY', assetCode: 'PLB-HQ-001', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 142, sourceChannel: SourceChannel.WEB, hasPublicComment: true },
  { title: 'Door access reader intermittent failure', description: 'RFID reader at the server room entrance misses valid badge taps.', status: RequestStatus.TRIAGE, priority: RequestPriority.MEDIUM, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'admin', assignee: 'coordinator_1', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 136, sourceChannel: SourceChannel.WEB },
  { title: 'Emergency lighting battery replacement', description: 'Quarterly inspection failed — east corridor emergency units did not activate.', status: RequestStatus.ASSIGNED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator_1', assignee: 'technician_3', locationId: 'HQ-4F-EAST', assetCode: 'ELEC-HQ-001', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 130, sourceChannel: SourceChannel.WEB, hasPublicComment: true },
  { title: 'Wi-Fi dead zone near cafeteria', description: 'Signal drops below usable threshold during the lunch peak period.', status: RequestStatus.ASSIGNED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_2', assignee: 'technician_2', locationId: 'HQ-CAFETERIA', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 124, sourceChannel: SourceChannel.WEB },
  { title: 'Ceiling stain inspection request', description: 'Potential condensation leak detected near the HR office on the 3rd floor.', status: RequestStatus.ASSIGNED, priority: RequestPriority.LOW, serviceTypeCode: 'HVAC', requester: 'employee_1', assignee: 'technician_1', locationId: 'HQ-3F-HR', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 118, sourceChannel: SourceChannel.EMAIL },
  { title: 'CRM app timeout during customer lookup', description: 'Response latency exceeds 15 seconds after login on the sales floor.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_1', assignee: 'technician_2', locationId: 'HQ-6F-SALES', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 112, sourceChannel: SourceChannel.PHONE, hasPublicComment: true, hasInternalNote: true, hasWorkLog: true },
  { title: 'Chiller vibration anomaly', description: 'Building management system is flagging sustained vibration spikes on the basement chiller.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.URGENT, serviceTypeCode: 'HVAC', requester: 'coordinator_1', assignee: 'technician_1', locationId: 'HQ-BASEMENT', assetCode: 'HVAC-HQ-001', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.CRITICAL, slaHealth: SlaHealth.BREACHED, hoursAgo: 106, sourceChannel: SourceChannel.PHONE, hasPublicComment: true, hasInternalNote: true, hasWorkLog: true },
  { title: 'Restroom exhaust fan replacement', description: 'Motor noise and reduced airflow reported on the 7th floor restroom.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee_2', assignee: 'technician_3', locationId: 'HQ-7F-RESTROOM', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 100, sourceChannel: SourceChannel.WEB, hasPublicComment: true, hasWorkLog: true },
  { title: 'Desktop endpoint protection reinstall', description: 'Security agent crashed after a forced OS update on finance floor machines.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-8F-SECURITY', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 94, sourceChannel: SourceChannel.EMAIL, hasPublicComment: true, hasWorkLog: true },
  { title: 'Vendor dispatch for main pump failure', description: 'Internal team cannot replace the custom pump component — specialist vendor required.', status: RequestStatus.WAITING_EXTERNAL_VENDOR, priority: RequestPriority.URGENT, serviceTypeCode: 'PLUMBING', requester: 'coordinator_2', assignee: 'coordinator_1', locationId: 'HQ-UTILITY', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.CRITICAL, slaHealth: SlaHealth.BREACHED, hoursAgo: 88, sourceChannel: SourceChannel.PHONE, hasPublicComment: true, escalated: true },
  { title: 'Meeting room projector lamp replacement', description: 'Projector brightness dropped below acceptable threshold in MR1.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-5F-MR1', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 82, sourceChannel: SourceChannel.WEB, hasPublicComment: true, hasWorkLog: true },
  { title: 'Floor drain unclogged in loading dock', description: 'Drainage restored after debris removal and full pipe flush.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'PLUMBING', requester: 'coordinator_1', assignee: 'technician_1', locationId: 'HQ-DOCK', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 76, sourceChannel: SourceChannel.WEB, hasPublicComment: true, hasWorkLog: true },
  { title: 'Router firmware patch complete', description: 'Security hotfix applied and validated across the staging VLAN.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 70, sourceChannel: SourceChannel.WEB, hasPublicComment: true, hasWorkLog: true },
  { title: 'Lift sensor calibration completed', description: 'Post-maintenance calibration passed all safety checks.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_2', assignee: 'technician_3', locationId: 'HQ-LIFT', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 64, sourceChannel: SourceChannel.WEB, hasPublicComment: true, hasWorkLog: true },
  { title: 'Duplicate request for pantry repaint cancelled', description: 'Request cancelled — a work order for this task is already active.', status: RequestStatus.CANCELLED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_1', assignee: 'coordinator_2', locationId: 'HQ-2F-PANTRY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 58, sourceChannel: SourceChannel.WEB, hasPublicComment: true },
  { title: 'Reopened: intermittent VPN disconnects', description: 'Issue recurred after previous closure — deeper root cause analysis needed.', status: RequestStatus.REOPENED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_2', assignee: 'technician_2', locationId: 'REMOTE', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 52, sourceChannel: SourceChannel.EMAIL, hasPublicComment: true, hasInternalNote: true, hasWorkLog: true },

  // ── Historical data for trend charts (days 8–30) ──────────────────────────
  // Day 8
  { title: 'Keyboard and mouse unresponsive at workstation 12B', description: 'USB hub replaced, devices confirmed working.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_1', assignee: 'technician_2', locationId: 'HQ-2F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 192, hasWorkLog: true },
  { title: 'Broken window latch in conference room C', description: 'Latch mechanism replaced and tested.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_2', assignee: 'technician_3', locationId: 'HQ-4F-C', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 200 },
  { title: 'Cold water tap dripping in executive washroom', description: 'Washer replaced, tap seal confirmed tight.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'PLUMBING', requester: 'admin', assignee: 'technician_1', locationId: 'HQ-8F-EXEC', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 208, hasWorkLog: true },
  // Day 9
  { title: 'Hallway lighting flickering on 3rd floor east wing', description: 'Ballast units replaced in east wing corridor.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-3F-EAST', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.AT_RISK, hoursAgo: 220, hasWorkLog: true },
  { title: 'Badge printer out of ribbon in reception', description: 'Ribbon cartridge restocked, test print passed.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_2', assignee: 'technician_2', locationId: 'HQ-1F-RECEPTION', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 232 },
  // Day 10
  { title: 'Smoke detector false alarm on 6th floor', description: 'Sensor cleaned and sensitivity recalibrated.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator_1', assignee: 'technician_3', locationId: 'HQ-6F', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 244, hasWorkLog: true },
  { title: 'Pantry refrigerator not cooling properly', description: 'Refrigerant topped up, thermostat set correctly.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'employee_1', assignee: 'technician_1', locationId: 'HQ-5F-PANTRY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 252, hasWorkLog: true },
  { title: 'Desk phone no dial tone at sales desk 4', description: 'PBX port reset, handset replaced.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_2', assignee: 'technician_2', locationId: 'HQ-6F-SALES', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 260 },
  // Day 11
  { title: 'Carpet tile loose near elevator lobby', description: 'Tile re-adhered and edges secured.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-2F-LOBBY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 272 },
  { title: 'Network switch port flapping in server room', description: 'SFP module replaced, port stable at 1Gbps.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 280, hasWorkLog: true },
  // Day 12
  { title: 'Outdoor signage lighting failure', description: 'Three exterior flood lamps replaced.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician_3', locationId: 'HQ-EXTERIOR', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 292 },
  { title: 'Hot water heater tripping breaker in basement', description: 'Element replaced, breaker load confirmed within spec.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator_1', assignee: 'technician_3', locationId: 'HQ-BASEMENT', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 300, hasWorkLog: true },
  { title: 'Email client crash on Windows 11 laptops', description: 'Profile rebuild and Outlook update resolved issue.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_1', assignee: 'technician_2', locationId: 'HQ-7F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 308, hasWorkLog: true },
  // Day 13
  { title: 'Air freshener dispenser unit not working', description: 'Battery pack replaced, motor functional.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_2', assignee: 'technician_3', locationId: 'HQ-3F-RESTROOM', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 320 },
  { title: 'Backup generator test run failed', description: 'Fuel filter replaced and automatic transfer switch tested.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician_3', locationId: 'HQ-UTILITY', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 328, hasWorkLog: true },
  // Day 14
  { title: 'Projector HDMI port damaged in board room', description: 'HDMI board replaced, all inputs confirmed functional.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'coordinator_2', assignee: 'technician_2', locationId: 'HQ-10F-BOARD', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 340, hasWorkLog: true },
  { title: 'Sink drain slow in ground floor washroom', description: 'Drain cleaned, flow rate normal.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'PLUMBING', requester: 'employee_2', assignee: 'technician_1', locationId: 'HQ-1F-RESTROOM', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 348 },
  { title: 'VPN gateway throughput degraded', description: 'Firewall rule corrected, throughput restored to 800 Mbps.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 356, hasWorkLog: true },
  // Day 15
  { title: 'Motion sensor light not activating in parking deck', description: 'Sensor aligned and sensitivity adjusted.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-PARKING', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 368 },
  { title: 'Coffee machine error code E5 in 4th floor kitchen', description: 'Descaling cycle run and brew unit cleaned.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_2', assignee: 'technician_3', locationId: 'HQ-4F-KITCHEN', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 376 },
  // Day 16
  { title: 'IT asset inventory scan overdue', description: 'Full asset scan completed, 214 devices catalogued.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 388 },
  { title: "Fire hose cabinet door warped and won't latch", description: 'Cabinet door replaced, latch mechanism confirmed secure.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'coordinator_1', assignee: 'technician_3', locationId: 'HQ-5F-STAIRWELL', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.BREACHED, hoursAgo: 396, hasWorkLog: true },
  { title: 'Overhead AHU fan belt worn on floor 9', description: 'Belt replaced, AHU running within spec.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator_2', assignee: 'technician_1', locationId: 'HQ-9F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 404, hasWorkLog: true },
  // Day 17
  { title: 'Biometric attendance terminal offline', description: 'Firmware update applied, terminal back online.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-1F-ENTRANCE', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 416 },
  { title: 'Broken venetian blind in CEO office', description: 'Blind unit replaced, slats aligned correctly.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'admin', assignee: 'technician_3', locationId: 'HQ-10F-CEO', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 424 },
  // Day 18
  { title: 'Server room humidity sensor alarm', description: 'Humidifier setpoint corrected, RH within 45-55% range.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'HVAC', requester: 'admin', assignee: 'technician_1', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 436, hasWorkLog: true },
  { title: 'Parking barrier arm stuck in raised position', description: 'Motor controller replaced, arm cycles correctly.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-PARKING', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 444 },
  { title: 'SSL certificate expired on intranet portal', description: 'Certificate renewed and auto-renewal configured.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 452, hasWorkLog: true },
  // Day 19
  { title: 'Water fountain not chilling on 2nd floor', description: 'Chiller thermostat replaced, water temperature at 10 degrees C.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'PLUMBING', requester: 'employee_2', assignee: 'technician_1', locationId: 'HQ-2F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 464 },
  { title: 'Printer paper jam recurring on floor 8', description: 'Feed roller replaced, jam sensor cleared.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_1', assignee: 'technician_2', locationId: 'HQ-8F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 472 },
  // Day 20
  { title: 'Stairwell emergency exit sign not lit', description: 'LED driver replaced, sign illuminated continuously.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator_1', assignee: 'technician_3', locationId: 'HQ-STAIRWELL-W', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 484, hasWorkLog: true },
  { title: 'Wireless presenter dongle lost in meeting room A', description: 'Replacement dongle issued and paired.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_2', assignee: 'technician_2', locationId: 'HQ-3F-A', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 492 },
  { title: 'Condensate drain blocked on rooftop unit', description: 'Drain cleared, slope corrected to prevent pooling.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator_2', assignee: 'technician_1', locationId: 'HQ-ROOFTOP', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 500, hasWorkLog: true },
  // Day 21
  { title: 'Access control panel battery backup failure', description: 'Backup battery bank replaced, UPS runtime verified.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician_3', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 512, hasWorkLog: true },
  { title: 'Pantry hot water dispenser leaking at base', description: 'O-ring seal replaced, unit tested leak-free.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'PLUMBING', requester: 'employee_1', assignee: 'technician_1', locationId: 'HQ-6F-PANTRY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 520 },
  // Day 22
  { title: 'CCTV camera offline at loading dock entrance', description: 'Camera replaced, NVR feed verified.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'admin', assignee: 'technician_3', locationId: 'HQ-DOCK', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 532, hasWorkLog: true },
  { title: 'Desk height-adjust motor not responding', description: 'Control box replaced on standing desk unit 22C.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_2', assignee: 'technician_3', locationId: 'HQ-7F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 540 },
  // Day 23
  { title: 'UPS unit beeping in comms room floor 4', description: 'Battery replaced, self-test passed.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician_3', locationId: 'HQ-4F-COMMS', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 556, hasWorkLog: true },
  { title: 'Treadmill display broken in gym area', description: 'Display board replaced, calibration confirmed.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-B1-GYM', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 564 },
  // Day 24
  { title: 'Boardroom AV system audio dropout', description: 'Audio matrix firmware updated, all channels stable.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'coordinator_2', assignee: 'technician_2', locationId: 'HQ-10F-BOARD', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 580, hasWorkLog: true },
  { title: 'Cold aisle containment door off track', description: 'Door re-hung and seals replaced in server room cold aisle.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'admin', assignee: 'technician_1', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 588 },
  // Day 25
  { title: 'Grease trap cleaning overdue in cafeteria kitchen', description: 'Trap pumped and cleaned, inspection certificate issued.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'PLUMBING', requester: 'coordinator_1', assignee: 'technician_1', locationId: 'HQ-CAFETERIA', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 604, hasWorkLog: true },
  { title: 'Power socket damaged in open plan area 3F', description: 'Socket module replaced, earth continuity verified.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-3F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 612 },
  { title: 'Lobby digital display showing blank screen', description: 'Media player rebooted and display cable reseated.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_2', assignee: 'technician_2', locationId: 'HQ-LOBBY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 620 },
  // Day 26
  { title: 'Roof membrane inspection after heavy rain', description: 'Minor ponding areas patched, drainage cleared.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'coordinator_1', assignee: 'technician_3', locationId: 'HQ-ROOFTOP', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 632, hasWorkLog: true },
  { title: 'Network time sync failure on production servers', description: 'NTP configuration corrected across all servers.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 640, hasWorkLog: true },
  // Day 27
  { title: 'Revolving door sensor malfunction at main entrance', description: 'Presence sensor replaced, door speed recalibrated.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_2', assignee: 'technician_3', locationId: 'HQ-MAIN-ENTRANCE', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 656, hasWorkLog: true },
  { title: 'Expansion valve noise in penthouse HVAC', description: 'Valve replaced and refrigerant charge verified.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator_2', assignee: 'technician_1', locationId: 'HQ-10F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 664, hasWorkLog: true },
  // Day 28
  { title: 'Door intercom static noise at visitor reception', description: 'Intercom handset replaced, audio clear.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee_1', assignee: 'technician_3', locationId: 'HQ-1F-RECEPTION', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 676 },
  { title: 'ERP login page slow after patch deployment', description: 'JVM heap settings tuned, page load under 2 seconds.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician_2', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 684, hasWorkLog: true },
  // Day 29
  { title: 'Cooling tower water treatment chemicals low', description: 'Chemical dosing system refilled, water quality within spec.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator_1', assignee: 'technician_1', locationId: 'HQ-ROOFTOP', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 700, hasWorkLog: true },
  { title: 'Label printer driver missing on finance PC', description: 'Driver reinstalled and test labels printed successfully.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_2', assignee: 'technician_2', locationId: 'HQ-9F-FINANCE', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 708 },
  // Day 30
  { title: 'Chilled water flow meter showing zero reading', description: 'Flow meter sensor replaced, readings normalised.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'HVAC', requester: 'coordinator_2', assignee: 'technician_1', locationId: 'HQ-BASEMENT', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 720, hasWorkLog: true },
  { title: 'Wi-Fi AP hardware fault in basement car park', description: 'AP unit replaced and channels reconfigured.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee_1', assignee: 'technician_2', locationId: 'HQ-PARKING', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 728, hasWorkLog: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function subtractHours(base: Date, hours: number): Date {
  return new Date(base.getTime() - hours * 60 * 60 * 1000);
}

function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60 * 1000);
}

// ─── RBAC Seeding ─────────────────────────────────────────────────────────────

async function seedRbac(): Promise<void> {
  for (const role of roles) {
    await prisma.authRole.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }

  for (const permission of permissions) {
    await prisma.authPermission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
    for (const permissionCode of permissionCodes) {
      await prisma.authRolePermission.upsert({
        where: { roleCode_permissionCode: { roleCode, permissionCode } },
        update: {},
        create: { roleCode, permissionCode },
      });
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await seedRbac();

  const now = new Date();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'supportops-demo' },
    update: { name: 'SupportOps Demo Tenant', status: TenantStatus.ACTIVE },
    create: { name: 'SupportOps Demo Tenant', slug: 'supportops-demo', status: TenantStatus.ACTIVE },
  });

  const usersByKey = new Map<DemoAccountKey, { id: string; fullName: string }>();

  for (const account of demoAccounts) {
    const fullName = `${account.firstName} ${account.lastName}`.trim();
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: account.email } },
      update: {
        fullName,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.legacyRole,
        department: account.department,
        country: 'VN',
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        isEmailVerified: true,
        emailVerifiedAt: now,
        isActive: true,
        status: UserStatus.ACTIVE,
        passwordHash,
      },
      create: {
        tenantId: tenant.id,
        email: account.email,
        fullName,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.legacyRole,
        department: account.department,
        country: 'VN',
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        isEmailVerified: true,
        emailVerifiedAt: now,
        isActive: true,
        status: UserStatus.ACTIVE,
        passwordHash,
      },
      select: { id: true, fullName: true },
    });
    usersByKey.set(account.key, { id: user.id, fullName: user.fullName ?? fullName });
  }

  const adminUserId = usersByKey.get('admin')!.id;

  for (const account of demoAccounts) {
    const user = usersByKey.get(account.key)!;
    const invitedById = account.key === 'admin' ? null : adminUserId;
    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {
        roleCode: account.roleCode,
        status: MembershipStatus.ACTIVE,
        invitedAt: subtractHours(now, 24 * 30),
        joinedAt: subtractHours(now, 24 * 29),
        invitedById,
      },
      create: {
        tenantId: tenant.id,
        userId: user.id,
        roleCode: account.roleCode,
        status: MembershipStatus.ACTIVE,
        invitedAt: subtractHours(now, 24 * 30),
        joinedAt: subtractHours(now, 24 * 29),
        invitedById,
      },
    });

    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        tenantId: tenant.id,
        assignmentAlerts: true,
        statusUpdateAlerts: true,
        slaRiskAlerts: true,
        escalationAlerts: true,
        resolutionReminders: true,
        requestUpdateDigest: true,
        commentNotifications: true,
        mentionNotifications: true,
      },
      create: {
        userId: user.id,
        tenantId: tenant.id,
        assignmentAlerts: true,
        statusUpdateAlerts: true,
        slaRiskAlerts: true,
        escalationAlerts: true,
        resolutionReminders: true,
        requestUpdateDigest: true,
        commentNotifications: true,
        mentionNotifications: true,
      },
    });
  }

  // ─── Service Types & SLA Policies ─────────────────────────────────────────

  const serviceTypeDefinitions = [
    { code: 'HVAC', name: 'HVAC', description: 'Heating, ventilation and air conditioning support.', responseMinutes: 30, resolutionMinutes: 8 * 60 },
    { code: 'ELECTRICAL', name: 'Electrical', description: 'Power, lighting and electrical equipment issues.', responseMinutes: 60, resolutionMinutes: 10 * 60 },
    { code: 'PLUMBING', name: 'Plumbing', description: 'Water supply, drainage and plumbing maintenance.', responseMinutes: 45, resolutionMinutes: 8 * 60 },
    { code: 'IT_SUPPORT', name: 'IT Support', description: 'Desktop, network and enterprise application support.', responseMinutes: 30, resolutionMinutes: 6 * 60 },
    { code: 'GENERAL_MAINTENANCE', name: 'General Maintenance', description: 'General facilities and operations requests.', responseMinutes: 120, resolutionMinutes: 24 * 60 },
  ] as const;

  const serviceTypesByCode = new Map<string, { id: string; code: string; name: string }>();
  for (const serviceType of serviceTypeDefinitions) {
    const created = await prisma.serviceType.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: serviceType.code } },
      update: { name: serviceType.name, description: serviceType.description, isActive: true },
      create: { tenantId: tenant.id, code: serviceType.code, name: serviceType.name, description: serviceType.description, isActive: true },
      select: { id: true, code: true, name: true },
    });
    serviceTypesByCode.set(created.code, created);

    await prisma.slaPolicy.upsert({
      where: { tenantId_serviceTypeCode: { tenantId: tenant.id, serviceTypeCode: serviceType.code } },
      update: {
        responseMinutes: serviceType.responseMinutes,
        resolutionMinutes: serviceType.resolutionMinutes,
        escalationAfterMinutes: Math.floor(serviceType.resolutionMinutes * 0.75),
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        serviceTypeCode: serviceType.code,
        responseMinutes: serviceType.responseMinutes,
        resolutionMinutes: serviceType.resolutionMinutes,
        escalationAfterMinutes: Math.floor(serviceType.resolutionMinutes * 0.75),
        isActive: true,
      },
    });
  }

  // ─── Asset Types ──────────────────────────────────────────────────────────

  const assetTypeDefinitions = [
    { name: 'HVAC Equipment', category: 'Mechanical', description: 'Heating, ventilation, and air conditioning units.' },
    { name: 'Electrical Panel', category: 'Electrical', description: 'Main and sub electrical distribution panels.' },
    { name: 'Plumbing Fixture', category: 'Plumbing', description: 'Sinks, drains, pumps, and plumbing fittings.' },
    { name: 'Network Hardware', category: 'IT', description: 'Routers, switches, access points, and cabling.' },
    { name: 'General Equipment', category: 'Facilities', description: 'Miscellaneous facilities and operations equipment.' },
  ];

  const assetTypesByName = new Map<string, { id: string }>();
  for (const def of assetTypeDefinitions) {
    const created = await prisma.assetType.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: def.name } },
      update: { category: def.category, description: def.description },
      create: { tenantId: tenant.id, ...def },
      select: { id: true, name: true },
    });
    assetTypesByName.set(def.name, { id: created.id });
  }

  // ─── Assets ───────────────────────────────────────────────────────────────

  const assetDefinitions = [
    { assetCode: 'HVAC-HQ-001', name: 'Main Lobby Chiller Unit', assetTypeName: 'HVAC Equipment', locationId: 'HQ-BASEMENT', status: AssetStatus.ACTIVE, model: 'Carrier AquaEdge 19DV', responsibleTeam: 'Facilities' },
    { assetCode: 'HVAC-HQ-002', name: 'Floor 5 AHU System', assetTypeName: 'HVAC Equipment', locationId: 'HQ-5F', status: AssetStatus.UNDER_MAINTENANCE, model: 'Daikin FXAQ', responsibleTeam: 'Facilities' },
    { assetCode: 'NET-HQ-001', name: 'Core Network Switch - HQ', assetTypeName: 'Network Hardware', locationId: 'HQ-NOC', status: AssetStatus.ACTIVE, model: 'Cisco Catalyst 9300', responsibleTeam: 'IT Operations' },
    { assetCode: 'NET-HQ-002', name: 'Meeting Room B AP Cluster', assetTypeName: 'Network Hardware', locationId: 'HQ-3F-B', status: AssetStatus.ACTIVE, model: 'Aruba AP-635', responsibleTeam: 'IT Operations' },
    { assetCode: 'PLB-HQ-001', name: 'Pantry Sink & Drain Unit', assetTypeName: 'Plumbing Fixture', locationId: 'HQ-2F-PANTRY', status: AssetStatus.OUT_OF_SERVICE, model: 'Elkay LRAD332260', responsibleTeam: 'Facilities' },
    { assetCode: 'ELEC-HQ-001', name: 'East Corridor Emergency Lighting Panel', assetTypeName: 'Electrical Panel', locationId: 'HQ-4F-EAST', status: AssetStatus.ACTIVE, model: 'Eaton PRL3a', responsibleTeam: 'Facilities' },
  ];

  const assetsByCode = new Map<string, { id: string }>();
  await prisma.asset.deleteMany({ where: { tenantId: tenant.id } });
  for (const def of assetDefinitions) {
    const assetType = assetTypesByName.get(def.assetTypeName);
    if (!assetType) continue;
    const created = await prisma.asset.create({
      data: { tenantId: tenant.id, assetCode: def.assetCode, name: def.name, assetTypeId: assetType.id, locationId: def.locationId, status: def.status, model: def.model, responsibleTeam: def.responsibleTeam },
      select: { id: true, assetCode: true },
    });
    assetsByCode.set(def.assetCode, { id: created.id });
  }

  // ─── Clear existing request data ──────────────────────────────────────────

  await prisma.$transaction(async (tx) => {
    await tx.requestAttachment.deleteMany({ where: { tenantId: tenant.id } });
    await tx.workLog.deleteMany({ where: { tenantId: tenant.id } });
    await tx.requestComment.deleteMany({ where: { tenantId: tenant.id } });
    await tx.requestActivity.deleteMany({ where: { tenantId: tenant.id } });
    await tx.assignmentHistory.deleteMany({ where: { tenantId: tenant.id } });
    await tx.slaRecord.deleteMany({ where: { tenantId: tenant.id } });
    await tx.auditLog.deleteMany({ where: { tenantId: tenant.id } });
    await tx.serviceRequest.deleteMany({ where: { tenantId: tenant.id } });
    await tx.requestSequence.deleteMany({ where: { tenantId: tenant.id } });
  });

  const currentYear = now.getUTCFullYear();
  await prisma.requestSequence.upsert({
    where: { tenantId_year: { tenantId: tenant.id, year: currentYear } },
    update: { lastNumber: demoRequests.length },
    create: { tenantId: tenant.id, year: currentYear, lastNumber: demoRequests.length },
  });

  // ─── Seed Requests ────────────────────────────────────────────────────────

  const defaultCoordinatorId = usersByKey.get('coordinator_1')!.id;

  for (let index = 0; index < demoRequests.length; index += 1) {
    const seed = demoRequests[index]!;
    const requester = usersByKey.get(seed.requester)!;
    const assignee = seed.assignee ? usersByKey.get(seed.assignee) : null;
    const serviceType = serviceTypesByCode.get(seed.serviceTypeCode)!;

    const createdAt = subtractHours(now, seed.hoursAgo);
    const submittedAt = addMinutes(createdAt, 15);
    const assignedAt = assignee ? addMinutes(createdAt, 45) : null;
    const startedAt =
      seed.status === RequestStatus.IN_PROGRESS ||
      seed.status === RequestStatus.WAITING_EXTERNAL_VENDOR ||
      seed.status === RequestStatus.RESOLVED ||
      seed.status === RequestStatus.CLOSED ||
      seed.status === RequestStatus.REOPENED
        ? addMinutes(createdAt, 90)
        : null;
    const resolvedAt =
      seed.status === RequestStatus.RESOLVED ||
      seed.status === RequestStatus.CLOSED ||
      seed.status === RequestStatus.REOPENED
        ? addMinutes(createdAt, 6 * 60)
        : null;
    const closedAt =
      seed.status === RequestStatus.CLOSED || seed.status === RequestStatus.REOPENED
        ? addMinutes(createdAt, 7 * 60)
        : null;

    const assetId = seed.assetCode ? (assetsByCode.get(seed.assetCode)?.id ?? null) : null;
    const sourceChannel = seed.sourceChannel ?? SourceChannel.WEB;

    const request = await prisma.serviceRequest.create({
      data: {
        tenantId: tenant.id,
        requestCode: `REQ-${currentYear}-${String(index + 1).padStart(5, '0')}`,
        title: seed.title,
        description: seed.description,
        serviceTypeId: serviceType.id,
        status: seed.status,
        priority: seed.priority,
        impactLevel: seed.impactLevel,
        urgency: seed.urgency,
        locationId: seed.locationId,
        assetId,
        requesterId: requester.id,
        assigneeId: assignee?.id ?? null,
        sourceChannel,
        isInternalOnly: false,
        createdAt,
        updatedAt: addMinutes(createdAt, 120),
        submittedAt,
        assignedAt,
        startedAt,
        resolvedAt,
        closedAt,
      },
    });

    const slaDefinition = serviceTypeDefinitions.find((s) => s.code === seed.serviceTypeCode)!;

    await prisma.slaRecord.createMany({
      data: [
        {
          tenantId: tenant.id,
          requestId: request.id,
          type: SlaType.ASSIGNMENT,
          health: seed.slaHealth,
          targetAt: addMinutes(submittedAt, slaDefinition.responseMinutes),
          breachedAt: seed.slaHealth === SlaHealth.BREACHED ? addMinutes(submittedAt, slaDefinition.responseMinutes + 5) : null,
          lastCalculatedAt: addMinutes(createdAt, 110),
          isBreached: seed.slaHealth === SlaHealth.BREACHED,
          createdAt,
          updatedAt: addMinutes(createdAt, 110),
        },
        {
          tenantId: tenant.id,
          requestId: request.id,
          type: SlaType.RESOLUTION,
          health: seed.slaHealth === SlaHealth.BREACHED && seed.status !== RequestStatus.CLOSED ? SlaHealth.AT_RISK : seed.slaHealth,
          targetAt: addMinutes(submittedAt, slaDefinition.resolutionMinutes),
          breachedAt: seed.slaHealth === SlaHealth.BREACHED && seed.status !== RequestStatus.CLOSED ? addMinutes(submittedAt, slaDefinition.resolutionMinutes + 30) : null,
          lastCalculatedAt: addMinutes(createdAt, 110),
          isBreached: seed.slaHealth === SlaHealth.BREACHED && seed.status !== RequestStatus.CLOSED,
          createdAt,
          updatedAt: addMinutes(createdAt, 110),
        },
      ],
    });

    await prisma.requestActivity.create({
      data: {
        tenantId: tenant.id,
        requestId: request.id,
        type: RequestActivityType.REQUEST_CREATED,
        title: 'Request created',
        description: `Request ${request.requestCode ?? request.id} submitted by ${requester.fullName}.`,
        actorId: requester.id,
        actorRole: demoAccounts.find((a) => a.key === seed.requester)?.legacyRole ?? Role.MEMBER,
        metadata: { status: request.status, requestCode: request.requestCode },
        createdAt,
      },
    });

    await prisma.requestActivity.create({
      data: {
        tenantId: tenant.id,
        requestId: request.id,
        type: RequestActivityType.STATUS_CHANGED,
        title: 'Status updated',
        description: `Status moved to ${request.status}.`,
        actorId: requester.id,
        actorRole: demoAccounts.find((a) => a.key === seed.requester)?.legacyRole ?? Role.MEMBER,
        metadata: { from: RequestStatus.DRAFT, to: request.status },
        createdAt: addMinutes(createdAt, 15),
      },
    });

    if (assignee) {
      const assignedByKey =
        seed.assignee === 'coordinator_1' || seed.assignee === 'coordinator_2' ? seed.assignee : 'coordinator_1';
      const assignedById = usersByKey.get(assignedByKey)!.id;

      await prisma.assignmentHistory.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          fromAssigneeId: null,
          toAssigneeId: assignee.id,
          changedById: assignedById,
          reason: 'Initial assignment',
          changedAt: addMinutes(createdAt, 45),
        },
      });

      await prisma.requestActivity.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          type: RequestActivityType.ASSIGNED,
          title: 'Request assigned',
          description: `Assigned to ${assignee.fullName}.`,
          actorId: assignedById,
          actorRole: Role.ADMIN,
          metadata: { assigneeId: assignee.id },
          createdAt: addMinutes(createdAt, 45),
        },
      });
    }

    if (seed.hasPublicComment) {
      const templates = publicCommentTemplates[seed.serviceTypeCode] ?? publicCommentTemplates['GENERAL_MAINTENANCE']!;
      const commentBody = templates[index % templates.length]!;
      await prisma.requestComment.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          authorId: assignee?.id ?? requester.id,
          visibility: CommentVisibility.PUBLIC,
          body: commentBody,
          createdAt: addMinutes(createdAt, 120),
          updatedAt: addMinutes(createdAt, 120),
        },
      });
      await prisma.requestActivity.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          type: RequestActivityType.COMMENT_ADDED,
          title: 'Comment added',
          description: commentBody,
          actorId: assignee?.id ?? requester.id,
          actorRole: assignee ? Role.MEMBER : Role.ADMIN,
          metadata: { visibility: CommentVisibility.PUBLIC },
          createdAt: addMinutes(createdAt, 120),
        },
      });
    }

    if (seed.hasInternalNote) {
      const templates = internalNoteTemplates[seed.serviceTypeCode] ?? internalNoteTemplates['GENERAL_MAINTENANCE']!;
      const internalBody = templates[index % templates.length]!;
      await prisma.requestComment.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          authorId: defaultCoordinatorId,
          visibility: CommentVisibility.INTERNAL,
          body: internalBody,
          createdAt: addMinutes(createdAt, 135),
          updatedAt: addMinutes(createdAt, 135),
        },
      });
      await prisma.requestActivity.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          type: RequestActivityType.INTERNAL_NOTE_ADDED,
          title: 'Internal note added',
          description: internalBody,
          actorId: defaultCoordinatorId,
          actorRole: Role.ADMIN,
          metadata: { visibility: CommentVisibility.INTERNAL },
          createdAt: addMinutes(createdAt, 135),
        },
      });
    }

    if (seed.hasWorkLog) {
      const templates = workLogContentTemplates[seed.serviceTypeCode] ?? workLogContentTemplates['GENERAL_MAINTENANCE']!;
      const workLogContent = templates[index % templates.length]!;
      const minutesSpent = workLogMinutesByPriority[seed.priority];
      await prisma.workLog.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          authorId: assignee?.id ?? usersByKey.get('technician_1')!.id,
          content: workLogContent,
          minutesSpent,
          startedAt: addMinutes(createdAt, 150),
          endedAt: addMinutes(createdAt, 150 + minutesSpent),
          createdAt: addMinutes(createdAt, 150 + minutesSpent),
        },
      });
      await prisma.requestActivity.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          type: RequestActivityType.COMMENT_ADDED,
          title: 'Work log added',
          description: workLogContent,
          actorId: assignee?.id ?? usersByKey.get('technician_1')!.id,
          actorRole: Role.MEMBER,
          metadata: { visibility: CommentVisibility.INTERNAL, minutesSpent },
          createdAt: addMinutes(createdAt, 150 + minutesSpent),
        },
      });
    }

    if (seed.slaHealth === SlaHealth.AT_RISK) {
      await prisma.requestActivity.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          type: RequestActivityType.SLA_WARNING,
          title: 'SLA at risk',
          description: 'Request is approaching its SLA deadline.',
          actorId: null,
          actorRole: null,
          metadata: { health: SlaHealth.AT_RISK },
          createdAt: addMinutes(createdAt, 230),
        },
      });
    }

    if (seed.slaHealth === SlaHealth.BREACHED) {
      await prisma.requestActivity.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          type: RequestActivityType.SLA_BREACHED,
          title: seed.escalated ? 'Request escalated after SLA breach' : 'SLA breached',
          description: seed.escalated
            ? 'SLA deadline exceeded — request escalated for urgent coordination.'
            : 'SLA threshold exceeded. Incident requires escalation review.',
          actorId: null,
          actorRole: null,
          metadata: seed.escalated
            ? { isAuto: true, nextStatus: RequestStatus.WAITING_EXTERNAL_VENDOR }
            : { health: SlaHealth.BREACHED },
          createdAt: addMinutes(createdAt, 240),
        },
      });
    }
  }

  console.log(
    [
      '─────────────────────────────────────────',
      'Seed completed.',
      `Tenant:           supportops-demo`,
      `Email domain:     ${DEMO_EMAIL_DOMAIN}`,
      `Password source:  env(SEED_DEMO_PASSWORD)`,
      '',
      'Demo accounts:',
      ...demoAccounts.map((a) => `  ${a.roleCode.padEnd(16)} ${a.email}`),
      '',
      `Asset types:      ${assetTypeDefinitions.length}`,
      `Assets:           ${assetDefinitions.length}`,
      `Service requests: ${demoRequests.length}`,
      '─────────────────────────────────────────',
    ].join('\n'),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
