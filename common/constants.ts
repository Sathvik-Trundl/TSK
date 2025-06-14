export const resolverKey = "tpkResolver" as const;
export const rovoResolverKey = "handleRovoCommand" as const;
export const enableLicense = false;

export const pageModuleKeys = {
  ADMIN_PAGE: "tpk-admin-page",
  PROJECT_PAGE: "tpk-project-page",
  GLOBAL_PAGE: "tpk-global-page",
} as const;

export const adminPageRoutes = {
  USER_MANAGEMENT: "/user-management",
  FIELD_CONFIG: "/field-config",
  API_CONFIG: "/api-config",
  COST_CONFIG: "/cost-config",
} as const;

export const projectPageRoutes = {
  PROJECT_FIELDS: "/project-fields",
  COST_TRACKER: "/cost-tracker",
  // EARNED_VALUE: "/earned-value",
  GANTT_CHART: "/gantt-chart",
  AUDITLOG: "/auditlog",
  LINK_ISSUES: "/link-issues",
  TIMELINE: "/timeline",
} as const;

export const StorageKVConstants = {
  USER_MANAGEMENT_STORAGE: "userManagement",
};

export const storageKeys = {
  USER_MANAGEMENT: (userId: string) => `UMG_${userId}`,
};

export const globalPageRoutes = {
  HOMEPAGE: "/",
} as const;
