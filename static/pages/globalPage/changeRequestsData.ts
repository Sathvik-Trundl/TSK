// Dummy Users
export const dummyUsers: User[] = [
  {
    self: "https://api.atlassian.com/user/1",
    accountId: "acc-1",
    emailAddress: "alice@example.com",
    avatarUrls: {
      "48x48": "https://dummyimage.com/48x48/000/fff&text=A",
      "24x24": "https://dummyimage.com/24x24/000/fff&text=A",
      "16x16": "https://dummyimage.com/16x16/000/fff&text=A",
      "32x32": "https://dummyimage.com/32x32/000/fff&text=A",
    },
    displayName: "Alice Anderson",
    active: true,
    timeZone: "America/New_York",
    accountType: "atlassian",
  },
  {
    self: "https://api.atlassian.com/user/2",
    accountId: "acc-2",
    emailAddress: "bob@example.com",
    avatarUrls: {
      "48x48": "https://dummyimage.com/48x48/000/fff&text=B",
      "24x24": "https://dummyimage.com/24x24/000/fff&text=B",
      "16x16": "https://dummyimage.com/16x16/000/fff&text=B",
      "32x32": "https://dummyimage.com/32x32/000/fff&text=B",
    },
    displayName: "Bob Brown",
    active: true,
    timeZone: "America/Chicago",
    accountType: "atlassian",
  },
];

// Dummy Projects
export const dummyProjects: Project[] = [
  {
    expand: "",
    self: "https://api.atlassian.com/project/1001",
    id: "1001",
    key: "DUMMY",
    name: "Dummy Project",
    avatarUrls: {
      "48x48": "https://dummyimage.com/48x48/0af/fff&text=P",
      "24x24": "https://dummyimage.com/24x24/0af/fff&text=P",
      "16x16": "https://dummyimage.com/16x16/0af/fff&text=P",
      "32x32": "https://dummyimage.com/32x32/0af/fff&text=P",
    },
    projectTypeKey: "service_desk",
    simplified: false,
    style: "classic",
    isPrivate: false,
    properties: {},
    entityId: null,
    uuid: null,
  },
];

// Dummy Change Request IDs
const dummyChangeRequestIds = [
  "cr-001",
  "cr-002",
  "cr-003",
  "cr-004",
  "cr-005",
];

// Dummy Comments
export const dummyComments: RequestComment[] = [
  {
    id: "c-001",
    user: dummyUsers[0],
    comment: "Please update the runbook before changes.",
    changeRequestId: dummyChangeRequestIds[0],
    createdAt: "2025-06-14T12:30:00Z",
  },
  {
    id: "c-002",
    user: dummyUsers[1],
    comment: "Scheduled downtime approved.",
    changeRequestId: dummyChangeRequestIds[0],
    createdAt: "2025-06-14T13:00:00Z",
  },
];

// Dummy Meetings
export const dummyMeetings: Meetings[] = [
  {
    id: "m-001",
    title: "Change Review Call",
    changeRequestId: dummyChangeRequestIds[0],
    description: "Discuss details of the proposed DB schema change.",
    date: "2025-06-15T15:00:00Z",
    attendees: [dummyUsers[0].accountId, dummyUsers[1].accountId],
    notes: "Risk assessment done. Awaiting final sign-off.",
  },
];

// Dummy ChangeRequestStorage (for storage layer)
export const dummyChangeRequestStorage: ChangeRequestStorage[] = [
  {
    id: dummyChangeRequestIds[0],
    title: "Update Production DB Schema",
    requestedBy: dummyUsers[0].accountId,
    description: "Schema changes for new feature.",
    reason: "Enable new reporting capability.",
    impact: "Minimal downtime expected.",
    changeWindow: {
      start: "2025-06-16T22:00:00Z",
      end: "2025-06-16T23:00:00Z",
    },
    validationStatus: "Pending",
    approvalStatus: "Pending",
    phase: "Draft",
    projectId: dummyProjects[0].id,
    requiredApprovals: [dummyUsers[1].accountId],
    issueIds: ["JIRA-123", "JIRA-456"],
    additionalInfo: "Co-ordinate with DBA before execution.",
    createdAt: "2025-06-14T10:00:00Z",
    updatedAt: "2025-06-14T12:00:00Z",
    confluenceLink:
      "https://confluence.example.com/pages/viewpage.action?pageId=10001",
  },
];

// Dummy Change Requests
export const dummyChangeRequests: ChangeRequest[] = [
  {
    id: dummyChangeRequestIds[0],
    title: "Update Production DB Schema",
    requestedBy: dummyUsers[0],
    description: "Schema changes for new feature.",
    reason: "Enable new reporting capability.",
    impact: "Minimal downtime expected.",
    changeWindow: {
      start: "2025-06-16T22:00:00Z",
      end: "2025-06-16T23:00:00Z",
    },
    validationStatus: "Pending",
    approvalStatus: "Pending",
    phase: "Draft",
    project: dummyProjects[0],
    requiredApprovals: [dummyUsers[1]],
    issueIds: ["JIRA-123", "JIRA-456"],
    additionalInfo: "Co-ordinate with DBA before execution.",
    createdAt: "2025-06-14T10:00:00Z",
    updatedAt: "2025-06-14T12:00:00Z",
    confluenceLink:
      "https://confluence.example.com/pages/viewpage.action?pageId=10001",
    comments: [],
  },
  {
    id: dummyChangeRequestIds[1],
    title: "Patch Vulnerability in Web App",
    requestedBy: dummyUsers[1],
    description: "Apply security patch to fix XSS vulnerability.",
    reason: "Critical security issue identified by audit.",
    impact: "Potential short downtime, user re-authentication required.",
    changeWindow: {
      start: "2025-07-01T00:00:00Z",
      end: "2025-07-01T02:00:00Z",
    },
    validationStatus: "Approved",
    approvalStatus: "Pending",
    phase: "Validation Pending",
    project: dummyProjects[0],
    requiredApprovals: [dummyUsers[0]],
    issueIds: ["JIRA-789"],
    additionalInfo: "Notify security team before patch.",
    createdAt: "2025-06-20T08:30:00Z",
    updatedAt: "2025-06-21T09:00:00Z",
    confluenceLink:
      "https://confluence.example.com/pages/viewpage.action?pageId=10002",
    comments: [],
  },
  {
    id: dummyChangeRequestIds[2],
    title: "Upgrade Backend Server Hardware",
    requestedBy: dummyUsers[0],
    description: "Upgrade RAM and SSD in backend servers.",
    reason: "Performance bottleneck noticed during peak usage.",
    impact: "No downtime expected, handled by blue-green deployment.",
    changeWindow: {
      start: "2025-07-10T01:00:00Z",
      end: "2025-07-10T04:00:00Z",
    },
    validationStatus: "Approved",
    approvalStatus: "Approved",
    phase: "Approved",
    project: dummyProjects[0],
    requiredApprovals: [dummyUsers[1]],
    issueIds: ["JIRA-555", "JIRA-556"],
    additionalInfo: "Coordinate with IT team.",
    createdAt: "2025-06-25T11:00:00Z",
    updatedAt: "2025-06-26T13:45:00Z",
    confluenceLink:
      "https://confluence.example.com/pages/viewpage.action?pageId=10003",
    comments: [],
  },
  {
    id: dummyChangeRequestIds[3],
    title: "Remove Deprecated API Endpoints",
    requestedBy: dummyUsers[1],
    description: "Clean up and remove deprecated endpoints in v1 API.",
    reason: "Reducing maintenance overhead.",
    impact: "Clients using v1 API will need to migrate.",
    changeWindow: {
      start: "2025-08-01T03:00:00Z",
      end: "2025-08-01T06:00:00Z",
    },
    validationStatus: "Rejected",
    approvalStatus: "Rejected",
    phase: "Rejected",
    project: dummyProjects[0],
    requiredApprovals: [dummyUsers[0]],
    issueIds: ["JIRA-200", "JIRA-201"],
    additionalInfo: "Communicate breaking changes to partners.",
    createdAt: "2025-07-10T09:00:00Z",
    updatedAt: "2025-07-11T11:30:00Z",
    confluenceLink:
      "https://confluence.example.com/pages/viewpage.action?pageId=10004",
    comments: [],
  },
  {
    id: dummyChangeRequestIds[4],
    title: "Enable Multi-Factor Authentication (MFA)",
    requestedBy: dummyUsers[0],
    description: "Rollout MFA for all user accounts.",
    reason: "Enhance account security as per new policy.",
    impact: "All users must enroll MFA devices.",
    changeWindow: {
      start: "2025-08-15T04:00:00Z",
      end: "2025-08-15T06:00:00Z",
    },
    validationStatus: "Pending",
    approvalStatus: "Pending",
    phase: "Planned",
    project: dummyProjects[0],
    requiredApprovals: [dummyUsers[1]],
    issueIds: ["JIRA-900"],
    additionalInfo: "Helpdesk on standby for user issues.",
    createdAt: "2025-07-20T10:30:00Z",
    updatedAt: "2025-07-20T11:00:00Z",
    confluenceLink:
      "https://confluence.example.com/pages/viewpage.action?pageId=10005",
    comments: [],
  },
];


