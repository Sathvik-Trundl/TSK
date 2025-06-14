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
    issueIds: string[];
    additionalInfo: string;
    createdAt: string;
    updatedAt: string;
    confluenceLink: string;
    comments: Comment[];
  };

  type Phase =
    | "Draft"
    | "Validation pending"
    | "Valdation Rejected"
    | "Validation Approved"
    | "Planned"
    | "In-Progress"
    | "In-Discussion"
    | "Approved"
    | "Rejected";

  type ChangeRequestStatus = "Valid" | "Invalid" | "In-Progress" | "Done";

  type ChangeWindow = {
    start: string;
    end: string;
  };

  type Comment = {
    id: string;
    text: string;
    authorId: string;
    createdAt: string;
  };

  type ChangeRequestForm = Omit<
    ChangeRequest,
    | "createdAt"
    | "updatedAt"
    | "comments"
    | "validationStatus"
    | "approvalStatus"
    | "confluenceLink"
    | "changeWindow"
  >;

  type ChangeRequestStatus = "Pending" | "Approved" | "Rejected";

  type ChangeWindowPeriod = "week" | "month" | "year";
  type ChangeWindow = `${string}_${ChangeWindowPeriod}`;

  type Comment = {
    id: string;
    userId: string;
    comment: string;
    changeRequestId: string;
    createdAt: string;
  };

  type Meetings = {
    id: string;
    title: string;
    description: string;
    date: string;
    attendees: string[];
    notes: string;
  };
}

export {};
