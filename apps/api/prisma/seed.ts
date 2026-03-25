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

type DemoAccount = {
  key: 'admin' | 'coordinator' | 'technician' | 'employee';
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
    email: toDemoEmail('admin'),
    firstName: 'Tenant',
    lastName: 'Admin',
    roleCode: 'TENANT_ADMIN',
    legacyRole: Role.SUPER_ADMIN,
    department: 'Operations Leadership',
  },
  {
    key: 'coordinator',
    email: toDemoEmail('coordinator'),
    firstName: 'Ops',
    lastName: 'Coordinator',
    roleCode: 'OPS_COORDINATOR',
    legacyRole: Role.ADMIN,
    department: 'Service Operations',
  },
  {
    key: 'technician',
    email: toDemoEmail('technician'),
    firstName: 'Field',
    lastName: 'Technician',
    roleCode: 'TECHNICIAN',
    legacyRole: Role.MEMBER,
    department: 'Facilities',
  },
  {
    key: 'employee',
    email: toDemoEmail('employee'),
    firstName: 'Office',
    lastName: 'Employee',
    roleCode: 'EMPLOYEE',
    legacyRole: Role.MEMBER,
    department: 'People Operations',
  },
];

type DemoRequestSeed = {
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  serviceTypeCode: 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'IT_SUPPORT' | 'GENERAL_MAINTENANCE';
  requester: DemoAccount['key'];
  assignee?: DemoAccount['key'];
  locationId: string;
  assetCode?: string;
  impactLevel: RequestImpactLevel;
  urgency: RequestUrgency;
  slaHealth: SlaHealth;
  hoursAgo: number;
  hasPublicComment?: boolean;
  hasInternalNote?: boolean;
  hasWorkLog?: boolean;
  escalated?: boolean;
};

const demoRequests: DemoRequestSeed[] = [
  { title: 'Printer queue blocked on 5th floor', description: 'Shared printer hangs after receiving large PDF jobs.', status: RequestStatus.SUBMITTED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', locationId: 'HQ-5F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 160 },
  { title: 'Main lobby AC not cooling', description: 'Front desk reported room temp above 29C since morning.', status: RequestStatus.SUBMITTED, priority: RequestPriority.HIGH, serviceTypeCode: 'HVAC', requester: 'employee', locationId: 'HQ-LOBBY', assetCode: 'HVAC-HQ-001', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 154 },
  { title: 'Network packet loss in meeting room B', description: 'Video calls unstable during board meetings.', status: RequestStatus.SUBMITTED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'coordinator', locationId: 'HQ-3F-B', assetCode: 'NET-HQ-002', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 148 },
  { title: 'Water leak under pantry sink', description: 'Standing water found near pantry cabinet area.', status: RequestStatus.TRIAGE, priority: RequestPriority.HIGH, serviceTypeCode: 'PLUMBING', requester: 'employee', assignee: 'coordinator', locationId: 'HQ-2F-PANTRY', assetCode: 'PLB-HQ-001', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 142, hasPublicComment: true },
  { title: 'Door access reader intermittent failure', description: 'RFID reader at server room misses valid badges.', status: RequestStatus.TRIAGE, priority: RequestPriority.MEDIUM, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'admin', assignee: 'coordinator', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 136 },
  { title: 'Emergency lighting battery replacement', description: 'Quarterly inspection failed in east corridor.', status: RequestStatus.ASSIGNED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-4F-EAST', assetCode: 'ELEC-HQ-001', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 130, hasPublicComment: true },
  { title: 'Wi-Fi dead zone near cafeteria', description: 'Signal drops below usable threshold during lunch peak.', status: RequestStatus.ASSIGNED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-CAFETERIA', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 124 },
  { title: 'Ceiling stain inspection request', description: 'Potential condensation leak near HR office.', status: RequestStatus.ASSIGNED, priority: RequestPriority.LOW, serviceTypeCode: 'HVAC', requester: 'employee', assignee: 'technician', locationId: 'HQ-3F-HR', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 118 },
  { title: 'CRM app timeout during customer lookup', description: 'Response latency exceeds 15 seconds after login.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-6F-SALES', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 112, hasPublicComment: true, hasInternalNote: true, hasWorkLog: true },
  { title: 'Chiller vibration anomaly', description: 'Building management system flags sustained vibration spikes.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.URGENT, serviceTypeCode: 'HVAC', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-BASEMENT', assetCode: 'HVAC-HQ-001', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.CRITICAL, slaHealth: SlaHealth.BREACHED, hoursAgo: 106, hasPublicComment: true, hasInternalNote: true, hasWorkLog: true },
  { title: 'Restroom exhaust fan replacement', description: 'Motor noise and reduced airflow on 7th floor.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee', assignee: 'technician', locationId: 'HQ-7F-RESTROOM', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 100, hasPublicComment: true, hasWorkLog: true },
  { title: 'Desktop endpoint protection reinstall', description: 'Security agent crashed after forced OS update.', status: RequestStatus.IN_PROGRESS, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-8F-SECURITY', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 94, hasPublicComment: true, hasWorkLog: true },
  { title: 'Vendor dispatch for main pump failure', description: 'Internal team cannot replace custom pump component.', status: RequestStatus.WAITING_EXTERNAL_VENDOR, priority: RequestPriority.URGENT, serviceTypeCode: 'PLUMBING', requester: 'coordinator', assignee: 'coordinator', locationId: 'HQ-UTILITY', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.CRITICAL, slaHealth: SlaHealth.BREACHED, hoursAgo: 88, hasPublicComment: true, escalated: true },
  { title: 'Meeting room projector lamp replacement', description: 'Projector brightness dropped below acceptable level.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee', assignee: 'technician', locationId: 'HQ-5F-MR1', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 82, hasPublicComment: true, hasWorkLog: true },
  { title: 'Floor drain unclogged in loading dock', description: 'Drainage restored after debris removal and flush.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'PLUMBING', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-DOCK', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 76, hasPublicComment: true, hasWorkLog: true },
  { title: 'Router firmware patch complete', description: 'Security hotfix applied and validated in staging VLAN.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 70, hasPublicComment: true, hasWorkLog: true },
  { title: 'Lift sensor calibration completed', description: 'Post-maintenance calibration passed safety checks.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-LIFT', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 64, hasPublicComment: true, hasWorkLog: true },
  { title: 'Duplicate request for pantry repaint cancelled', description: 'Request cancelled because work order already active.', status: RequestStatus.CANCELLED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'coordinator', locationId: 'HQ-2F-PANTRY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 58, hasPublicComment: true },
  { title: 'Reopened: intermittent VPN disconnects', description: 'Issue recurred after previous closure, needs deeper analysis.', status: RequestStatus.REOPENED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'REMOTE', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.AT_RISK, hoursAgo: 52, hasPublicComment: true, hasInternalNote: true, hasWorkLog: true },

  // ── Historical data for trend chart (days 8–30) ─────────────────────────────
  // Day 8
  { title: 'Keyboard and mouse unresponsive at workstation 12B', description: 'USB hub replaced, devices confirmed working.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-2F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 192, hasWorkLog: true },
  { title: 'Broken window latch in conference room C', description: 'Latch mechanism replaced and tested.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-4F-C', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 200 },
  { title: 'Cold water tap dripping in executive washroom', description: 'Washer replaced, tap seal confirmed tight.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'PLUMBING', requester: 'admin', assignee: 'technician', locationId: 'HQ-8F-EXEC', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 208, hasWorkLog: true },
  // Day 9
  { title: 'Hallway lighting flickering on 3rd floor east wing', description: 'Ballast units replaced in east wing corridor.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee', assignee: 'technician', locationId: 'HQ-3F-EAST', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 220, hasWorkLog: true },
  { title: 'Badge printer out of ribbon in reception', description: 'Ribbon cartridge restocked, test print passed.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-1F-RECEPTION', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 232 },
  // Day 10
  { title: 'Smoke detector false alarm on 6th floor', description: 'Sensor cleaned and sensitivity recalibrated.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-6F', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 244, hasWorkLog: true },
  { title: 'Pantry refrigerator not cooling properly', description: 'Refrigerant topped up, thermostat set correctly.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'employee', assignee: 'technician', locationId: 'HQ-5F-PANTRY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 252, hasWorkLog: true },
  { title: 'Desk phone no dial tone at sales desk 4', description: 'PBX port reset, handset replaced.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-6F-SALES', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 260 },
  // Day 11
  { title: 'Carpet tile loose near elevator lobby', description: 'Tile re-adhered and edges secured.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-2F-LOBBY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 272 },
  { title: 'Network switch port flapping in server room', description: 'SFP module replaced, port stable at 1Gbps.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 280, hasWorkLog: true },
  // Day 12
  { title: 'Outdoor signage lighting failure', description: 'Three exterior flood lamps replaced.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician', locationId: 'HQ-EXTERIOR', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 292 },
  { title: 'Hot water heater tripping breaker in basement', description: 'Element replaced, breaker load confirmed within spec.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-BASEMENT', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 300, hasWorkLog: true },
  { title: 'Email client crash on Windows 11 laptops', description: 'Profile rebuild and Outlook update resolved issue.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-7F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 308, hasWorkLog: true },
  // Day 13
  { title: 'Air freshener dispenser unit not working', description: 'Battery pack replaced, motor functional.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-3F-RESTROOM', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 320 },
  { title: 'Backup generator test run failed', description: 'Fuel filter replaced and automatic transfer switch tested.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician', locationId: 'HQ-UTILITY', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 328, hasWorkLog: true },
  // Day 14
  { title: 'Projector HDMI port damaged in board room', description: 'HDMI board replaced, all inputs confirmed functional.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-10F-BOARD', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 340, hasWorkLog: true },
  { title: 'Sink drain slow in ground floor washroom', description: 'Drain cleaned, flow rate normal.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'PLUMBING', requester: 'employee', assignee: 'technician', locationId: 'HQ-1F-RESTROOM', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 348 },
  { title: 'VPN gateway throughput degraded', description: 'Firewall rule corrected, throughput restored to 800Mbps.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 356, hasWorkLog: true },
  // Day 15
  { title: 'Motion sensor light not activating in parking deck', description: 'Sensor aligned and sensitivity adjusted.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee', assignee: 'technician', locationId: 'HQ-PARKING', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 368 },
  { title: 'Coffee machine error code E5 in 4th floor kitchen', description: 'Descaling cycle run and brew unit cleaned.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-4F-KITCHEN', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 376 },
  // Day 16
  { title: 'IT asset inventory scan overdue', description: 'Full asset scan completed, 214 devices catalogued.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 388 },
  { title: 'Fire hose cabinet door warped and won\'t latch', description: 'Cabinet door replaced, latch mechanism confirmed secure.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-5F-STAIRWELL', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 396, hasWorkLog: true },
  { title: 'Overhead AHU fan belt worn on floor 9', description: 'Belt replaced, AHU running within spec.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-9F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 404, hasWorkLog: true },
  // Day 17
  { title: 'Biometric attendance terminal offline', description: 'Firmware update applied, terminal back online.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-1F-ENTRANCE', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 416 },
  { title: 'Broken venetian blind in CEO office', description: 'Blind unit replaced, slats aligned correctly.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'admin', assignee: 'technician', locationId: 'HQ-10F-CEO', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 424 },
  // Day 18
  { title: 'Server room humidity sensor alarm', description: 'Humidifier setpoint corrected, RH within 45-55% range.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'HVAC', requester: 'admin', assignee: 'technician', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 436, hasWorkLog: true },
  { title: 'Parking barrier arm stuck in raised position', description: 'Motor controller replaced, arm cycles correctly.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-PARKING', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 444 },
  { title: 'SSL certificate expired on intranet portal', description: 'Certificate renewed and auto-renewal configured.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 452, hasWorkLog: true },
  // Day 19
  { title: 'Water fountain not chilling on 2nd floor', description: 'Chiller thermostat replaced, water temp at 10°C.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'PLUMBING', requester: 'employee', assignee: 'technician', locationId: 'HQ-2F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 464 },
  { title: 'Printer paper jam recurring on floor 8', description: 'Feed roller replaced, jam sensor cleared.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-8F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 472 },
  // Day 20
  { title: 'Stairwell emergency exit sign not lit', description: 'LED driver replaced, sign illuminated continuously.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-STAIRWELL-W', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 484, hasWorkLog: true },
  { title: 'Wireless presenter dongle lost in meeting room A', description: 'Replacement dongle issued and paired.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-3F-A', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 492 },
  { title: 'Condensate drain blocked on rooftop unit', description: 'Drain cleared, slope corrected to prevent pooling.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-ROOFTOP', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 500, hasWorkLog: true },
  // Day 21
  { title: 'Access control panel battery backup failure', description: 'Backup battery bank replaced, UPS runtime verified.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 512, hasWorkLog: true },
  { title: 'Pantry hot water dispenser leaking at base', description: 'O-ring seal replaced, unit tested leak-free.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'PLUMBING', requester: 'employee', assignee: 'technician', locationId: 'HQ-6F-PANTRY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 520 },
  // Day 22
  { title: 'CCTV camera offline at loading dock entrance', description: 'Camera replaced, NVR feed verified.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'admin', assignee: 'technician', locationId: 'HQ-DOCK', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 532, hasWorkLog: true },
  { title: 'Desk height-adjust motor not responding', description: 'Control box replaced on standing desk unit 22C.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-7F', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 540 },
  // Day 23
  { title: 'UPS unit beeping in comms room floor 4', description: 'Battery replaced, self-test passed.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'ELECTRICAL', requester: 'admin', assignee: 'technician', locationId: 'HQ-4F-COMMS', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 556, hasWorkLog: true },
  { title: 'Treadmill display broken in gym area', description: 'Display board replaced, calibration confirmed.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-B1-GYM', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 564 },
  // Day 24
  { title: 'Boardroom AV system audio dropout', description: 'Audio matrix firmware updated, all channels stable.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-10F-BOARD', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 580, hasWorkLog: true },
  { title: 'Cold aisle containment door off track', description: 'Door re-hung and seals replaced in server room cold aisle.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'admin', assignee: 'technician', locationId: 'HQ-1F-SERVER', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 588 },
  // Day 25
  { title: 'Grease trap cleaning overdue in cafeteria kitchen', description: 'Trap pumped and cleaned, inspection certificate issued.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'PLUMBING', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-CAFETERIA', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 604, hasWorkLog: true },
  { title: 'Power socket damaged in open plan area 3F', description: 'Socket module replaced, earth continuity verified.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'ELECTRICAL', requester: 'employee', assignee: 'technician', locationId: 'HQ-3F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 612 },
  { title: 'Lobby digital display showing blank screen', description: 'Media player rebooted and display cable reseated.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-LOBBY', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 620 },
  // Day 26
  { title: 'Roof membrane inspection after heavy rain', description: 'Minor ponding areas patched, drainage cleared.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-ROOFTOP', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 632, hasWorkLog: true },
  { title: 'Network time sync failure on production servers', description: 'NTP configuration corrected across all servers.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 640, hasWorkLog: true },
  // Day 27
  { title: 'Revolving door sensor malfunction at main entrance', description: 'Presence sensor replaced, door speed recalibrated.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-MAIN-ENTRANCE', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 656, hasWorkLog: true },
  { title: 'Expansion valve noise in penthouse HVAC', description: 'Valve replaced and refrigerant charge verified.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-10F', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 664, hasWorkLog: true },
  // Day 28
  { title: 'Door intercom static noise at visitor reception', description: 'Intercom handset replaced, audio clear.', status: RequestStatus.CLOSED, priority: RequestPriority.LOW, serviceTypeCode: 'GENERAL_MAINTENANCE', requester: 'employee', assignee: 'technician', locationId: 'HQ-1F-RECEPTION', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 676 },
  { title: 'ERP login page slow after patch deployment', description: 'JVM heap settings tuned, page load under 2s.', status: RequestStatus.RESOLVED, priority: RequestPriority.HIGH, serviceTypeCode: 'IT_SUPPORT', requester: 'admin', assignee: 'technician', locationId: 'HQ-NOC', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 684, hasWorkLog: true },
  // Day 29
  { title: 'Cooling tower water treatment chemicals low', description: 'Chemical dosing system refilled, water quality within spec.', status: RequestStatus.CLOSED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'HVAC', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-ROOFTOP', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 700, hasWorkLog: true },
  { title: 'Label printer driver missing on finance PC', description: 'Driver reinstalled and test labels printed successfully.', status: RequestStatus.RESOLVED, priority: RequestPriority.LOW, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-9F-FINANCE', impactLevel: RequestImpactLevel.LOW, urgency: RequestUrgency.LOW, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 708 },
  // Day 30
  { title: 'Chilled water flow meter showing zero reading', description: 'Flow meter sensor replaced, readings normalised.', status: RequestStatus.CLOSED, priority: RequestPriority.HIGH, serviceTypeCode: 'HVAC', requester: 'coordinator', assignee: 'technician', locationId: 'HQ-BASEMENT', impactLevel: RequestImpactLevel.HIGH, urgency: RequestUrgency.HIGH, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 720, hasWorkLog: true },
  { title: 'Wi-Fi AP hardware fault in basement car park', description: 'AP unit replaced and channels reconfigured.', status: RequestStatus.RESOLVED, priority: RequestPriority.MEDIUM, serviceTypeCode: 'IT_SUPPORT', requester: 'employee', assignee: 'technician', locationId: 'HQ-PARKING', impactLevel: RequestImpactLevel.MEDIUM, urgency: RequestUrgency.MEDIUM, slaHealth: SlaHealth.ON_TRACK, hoursAgo: 728, hasWorkLog: true },
];

function subtractHours(base: Date, hours: number): Date {
  return new Date(base.getTime() - hours * 60 * 60 * 1000);
}

function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60 * 1000);
}

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
        where: {
          roleCode_permissionCode: {
            roleCode,
            permissionCode,
          },
        },
        update: {},
        create: { roleCode, permissionCode },
      });
    }
  }
}

async function main(): Promise<void> {
  await seedRbac();

  const now = new Date();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'supportops-demo' },
    update: {
      name: 'SupportOps Demo Tenant',
      status: TenantStatus.ACTIVE,
    },
    create: {
      name: 'SupportOps Demo Tenant',
      slug: 'supportops-demo',
      status: TenantStatus.ACTIVE,
    },
  });

  const usersByKey = new Map<DemoAccount['key'], { id: string; fullName: string }>();

  for (const account of demoAccounts) {
    const fullName = `${account.firstName} ${account.lastName}`.trim();
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: account.email,
        },
      },
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
      select: {
        id: true,
        fullName: true,
      },
    });

    usersByKey.set(account.key, {
      id: user.id,
      fullName: user.fullName ?? fullName,
    });
  }

  const adminUserId = usersByKey.get('admin')!.id;

  for (const account of demoAccounts) {
    const user = usersByKey.get(account.key)!;
    const invitedById = account.key === 'admin' ? null : adminUserId;
    await prisma.membership.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user.id,
        },
      },
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

  const serviceTypeDefinitions = [
    { code: 'HVAC', name: 'HVAC', description: 'Heating, ventilation and air conditioning support.' },
    { code: 'ELECTRICAL', name: 'Electrical', description: 'Power, lighting and electrical equipment issues.' },
    { code: 'PLUMBING', name: 'Plumbing', description: 'Water supply, drainage and plumbing maintenance.' },
    { code: 'IT_SUPPORT', name: 'IT Support', description: 'Desktop, network and enterprise application support.' },
    { code: 'GENERAL_MAINTENANCE', name: 'General Maintenance', description: 'General facilities and operations requests.' },
  ] as const;

  const serviceTypesByCode = new Map<string, { id: string; code: string; name: string }>();
  for (const serviceType of serviceTypeDefinitions) {
    const created = await prisma.serviceType.upsert({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code: serviceType.code,
        },
      },
      update: {
        name: serviceType.name,
        description: serviceType.description,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        code: serviceType.code,
        name: serviceType.name,
        description: serviceType.description,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
    serviceTypesByCode.set(created.code, created);

    await prisma.slaPolicy.upsert({
      where: {
        tenantId_serviceTypeCode: {
          tenantId: tenant.id,
          serviceTypeCode: serviceType.code,
        },
      },
      update: {
        responseMinutes: 30,
        resolutionMinutes: 8 * 60,
        escalationAfterMinutes: 60,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        serviceTypeCode: serviceType.code,
        responseMinutes: 30,
        resolutionMinutes: 8 * 60,
        escalationAfterMinutes: 60,
        isActive: true,
      },
    });
  }

  // ─── Asset Types ───────────────────────────────────────────────────────────
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

  // ─── Assets ────────────────────────────────────────────────────────────────
  const assetDefinitions = [
    {
      assetCode: 'HVAC-HQ-001',
      name: 'Main Lobby Chiller Unit',
      assetTypeName: 'HVAC Equipment',
      locationId: 'HQ-BASEMENT',
      status: AssetStatus.ACTIVE,
      model: 'Carrier AquaEdge 19DV',
      responsibleTeam: 'Facilities',
    },
    {
      assetCode: 'HVAC-HQ-002',
      name: 'Floor 5 AHU System',
      assetTypeName: 'HVAC Equipment',
      locationId: 'HQ-5F',
      status: AssetStatus.UNDER_MAINTENANCE,
      model: 'Daikin FXAQ',
      responsibleTeam: 'Facilities',
    },
    {
      assetCode: 'NET-HQ-001',
      name: 'Core Network Switch - HQ',
      assetTypeName: 'Network Hardware',
      locationId: 'HQ-NOC',
      status: AssetStatus.ACTIVE,
      model: 'Cisco Catalyst 9300',
      responsibleTeam: 'IT Operations',
    },
    {
      assetCode: 'NET-HQ-002',
      name: 'Meeting Room B AP Cluster',
      assetTypeName: 'Network Hardware',
      locationId: 'HQ-3F-B',
      status: AssetStatus.ACTIVE,
      model: 'Aruba AP-635',
      responsibleTeam: 'IT Operations',
    },
    {
      assetCode: 'PLB-HQ-001',
      name: 'Pantry Sink & Drain Unit',
      assetTypeName: 'Plumbing Fixture',
      locationId: 'HQ-2F-PANTRY',
      status: AssetStatus.OUT_OF_SERVICE,
      model: 'Elkay LRAD332260',
      responsibleTeam: 'Facilities',
    },
    {
      assetCode: 'ELEC-HQ-001',
      name: 'East Corridor Emergency Lighting Panel',
      assetTypeName: 'Electrical Panel',
      locationId: 'HQ-4F-EAST',
      status: AssetStatus.ACTIVE,
      model: 'Eaton PRL3a',
      responsibleTeam: 'Facilities',
    },
  ];

  const assetsByCode = new Map<string, { id: string }>();
  // Clear existing assets to allow clean upsert
  await prisma.asset.deleteMany({ where: { tenantId: tenant.id } });
  for (const def of assetDefinitions) {
    const assetType = assetTypesByName.get(def.assetTypeName);
    if (!assetType) continue;
    const created = await prisma.asset.create({
      data: {
        tenantId: tenant.id,
        assetCode: def.assetCode,
        name: def.name,
        assetTypeId: assetType.id,
        locationId: def.locationId,
        status: def.status,
        model: def.model,
        responsibleTeam: def.responsibleTeam,
      },
      select: { id: true, assetCode: true },
    });
    assetsByCode.set(def.assetCode, { id: created.id });
  }

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
    where: {
      tenantId_year: {
        tenantId: tenant.id,
        year: currentYear,
      },
    },
    update: {
      lastNumber: demoRequests.length,
    },
    create: {
      tenantId: tenant.id,
      year: currentYear,
      lastNumber: demoRequests.length,
    },
  });

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
    const closedAt = seed.status === RequestStatus.CLOSED || seed.status === RequestStatus.REOPENED ? addMinutes(createdAt, 7 * 60) : null;

    const assetId = seed.assetCode ? (assetsByCode.get(seed.assetCode)?.id ?? null) : null;

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
        sourceChannel: SourceChannel.WEB,
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

    await prisma.slaRecord.createMany({
      data: [
        {
          tenantId: tenant.id,
          requestId: request.id,
          type: SlaType.ASSIGNMENT,
          health: seed.slaHealth,
          targetAt: addMinutes(submittedAt, 30),
          breachedAt: seed.slaHealth === SlaHealth.BREACHED ? addMinutes(submittedAt, 35) : null,
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
          targetAt: addMinutes(submittedAt, 8 * 60),
          breachedAt: seed.slaHealth === SlaHealth.BREACHED && seed.status !== RequestStatus.CLOSED ? addMinutes(submittedAt, 8 * 60 + 30) : null,
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
        description: `Request ${request.requestCode ?? request.id} created by ${requester.fullName}.`,
        actorId: requester.id,
        actorRole: demoAccounts.find((item) => item.key === seed.requester)?.legacyRole ?? Role.MEMBER,
        metadata: {
          status: request.status,
          requestCode: request.requestCode,
        },
        createdAt,
      },
    });

    await prisma.requestActivity.create({
      data: {
        tenantId: tenant.id,
        requestId: request.id,
        type: RequestActivityType.STATUS_CHANGED,
        title: 'Status changed',
        description: `Status moved to ${request.status}.`,
        actorId: requester.id,
        actorRole: demoAccounts.find((item) => item.key === seed.requester)?.legacyRole ?? Role.MEMBER,
        metadata: {
          from: RequestStatus.DRAFT,
          to: request.status,
        },
        createdAt: addMinutes(createdAt, 15),
      },
    });

    if (assignee) {
      await prisma.assignmentHistory.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          fromAssigneeId: null,
          toAssigneeId: assignee.id,
          changedById: usersByKey.get('coordinator')!.id,
          reason: 'Initial demo assignment',
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
          actorId: usersByKey.get('coordinator')!.id,
          actorRole: Role.ADMIN,
          metadata: {
            assigneeId: assignee.id,
          },
          createdAt: addMinutes(createdAt, 45),
        },
      });
    }

    if (seed.hasPublicComment) {
      const commentBody = 'Updated progress and shared latest findings with requester.';
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
          metadata: {
            visibility: CommentVisibility.PUBLIC,
          },
          createdAt: addMinutes(createdAt, 120),
        },
      });
    }

    if (seed.hasInternalNote) {
      const internalBody = 'Internal note: waiting for dependency from infrastructure team.';
      await prisma.requestComment.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          authorId: usersByKey.get('coordinator')!.id,
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
          actorId: usersByKey.get('coordinator')!.id,
          actorRole: Role.ADMIN,
          metadata: {
            visibility: CommentVisibility.INTERNAL,
          },
          createdAt: addMinutes(createdAt, 135),
        },
      });
    }

    if (seed.hasWorkLog) {
      const workLogContent = 'Inspected issue, executed remediation plan, and validated outcome.';
      await prisma.workLog.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          authorId: assignee?.id ?? usersByKey.get('technician')!.id,
          content: workLogContent,
          minutesSpent: 75,
          startedAt: addMinutes(createdAt, 150),
          endedAt: addMinutes(createdAt, 225),
          createdAt: addMinutes(createdAt, 225),
        },
      });
      await prisma.requestActivity.create({
        data: {
          tenantId: tenant.id,
          requestId: request.id,
          type: RequestActivityType.COMMENT_ADDED,
          title: 'Work log added',
          description: workLogContent,
          actorId: assignee?.id ?? usersByKey.get('technician')!.id,
          actorRole: Role.MEMBER,
          metadata: {
            visibility: CommentVisibility.INTERNAL,
            minutesSpent: 75,
          },
          createdAt: addMinutes(createdAt, 225),
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
          description: 'Request is close to SLA deadline.',
          actorId: null,
          actorRole: null,
          metadata: {
            health: SlaHealth.AT_RISK,
          },
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
            ? 'SLA breached and request escalated for urgent coordination.'
            : 'SLA threshold exceeded and incident requires escalation review.',
          actorId: null,
          actorRole: null,
          metadata: seed.escalated
            ? {
                isAuto: true,
                nextStatus: RequestStatus.WAITING_EXTERNAL_VENDOR,
              }
            : {
                health: SlaHealth.BREACHED,
              },
          createdAt: addMinutes(createdAt, 240),
        },
      });
    }
  }

  console.log(
    [
      'Seed completed.',
      `Tenant slug: supportops-demo`,
      `Demo email domain: ${DEMO_EMAIL_DOMAIN}`,
      `Demo password: ${DEMO_PASSWORD}`,
      `Users: ${demoAccounts.map((account) => account.email).join(', ')}`,
      `Asset types: ${assetTypeDefinitions.length}`,
      `Assets: ${assetDefinitions.length}`,
      `Service requests: ${demoRequests.length}`,
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
