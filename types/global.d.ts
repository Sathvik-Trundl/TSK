import { trpcRouter } from "../src/router";
import { type FullContext } from "@forge/bridge/out/types";

declare global {
  type TrpcRouter = typeof trpcRouter;

  type TrpcContext = FullContext;

  type UserManagementPerUser = {
    id: string;
    projectRoles: record<string, string>;
    createdAt: string;
    updatedAt: string;
  };

  type ChangeRequest = {
    id: string;
    title: string;
    requestedBy: User;
    description: string;
    reason: string;
    impact: string;
    changeWindow: ChangeWindow;
    validationStatus: ChangeRequestStatus;
    approvalStatus: ChangeRequestStatus;
    phase: Phase;
    project: Project;
    requiredApprovals: User[];
    issueIds: string[];
    additionalInfo: string;
    createdAt: string;
    updatedAt: string;
    confluenceLink: string;
    comments: RequestComment[];
  };

  type ChangeRequestStorage = {
    id: string;
    title: string;
    requestedBy: string;
    description: string;
    reason: string;
    impact: string;
    changeWindow: ChangeWindow;
    validationStatus: ChangeRequestStatus;
    approvalStatus: ChangeRequestStatus;
    phase: Phase;
    projectId: string;
    requiredApprovals: string[];
    issueIds: string[];
    additionalInfo: string;
    createdAt: string;
    updatedAt: string;
    confluenceLink: string;
  };

  type Phase =
    | "Draft"
    | "Validation Pending"
    | "Valdation Rejected"
    | "Validation Approved"
    | "Planned"
    | "In-Progress"
    | "In-Discussion"
    | "Approved"
    | "Rejected";

  type ChangeWindow = {
    start: string;
    end: string;
  };

  type RequestCommentStorage = {
    id: string;
    changeRequestId: string;
    comment: string;
    userId: string;
    createdAt: string;
  };

  type RequestComment = {
    id: string;
    changeRequestId: string;
    comment: string;
    user: User;
    createdAt: string;
  };

  type ChangeRequestForm = Omit<
    ChangeRequestStorage,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "comments"
    | "validationStatus"
    | "approvalStatus"
    | "confluenceLink"
    | "changeWindow"
    | "phase"
  >;

  type ChangeRequestStatus = "Pending" | "Approved" | "Rejected";

  type ChangeWindowPeriod = "week" | "month" | "year";
  type ChangeWindow = `${string}_${ChangeWindowPeriod}`;

  type Meetings = {
    id: string;
    title: string;
    changeRequestId: string;
    description: string;
    date: string;
    attendees: string[];
    notes: string;
  };

  type Project = {
    archived?: boolean;
    expand: string;
    self: string;
    id: string;
    key: string;
    name: string;
    avatarUrls: AvatarUrls;
    projectTypeKey: string;
    simplified: boolean;
    style: string;
    isPrivate: boolean;
    properties: object;
    entityId?: string | null;
    uuid?: string | null;
  };

  type AvatarUrls = {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };

  type User = {
    self: string;
    accountId: string;
    emailAddress: string;
    avatarUrls: AvatarUrls;
    displayName: string;
    active: boolean;
    timeZone: string;
    accountType: string;
  };
}

export {};
