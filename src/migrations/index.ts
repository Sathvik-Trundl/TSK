import { migrationRunner } from "@forge/sql";

export const CREATE_CHANGE_REQUESTS_TABLE = `
  CREATE TABLE IF NOT EXISTS ChangeRequests (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    requestedBy VARCHAR(255) NOT NULL,
    description TEXT,
    reason TEXT,
    impact TEXT,
    changeWindowStart DATETIME,
    changeWindowEnd DATETIME,
    validationStatus VARCHAR(50),
    approvalStatus VARCHAR(50),
    phase VARCHAR(50),
    projectId VARCHAR(255),
    requiredApprovals JSON,
    issueIds JSON,
    additionalInfo TEXT,
    confluenceLink VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );`;

const createDBObjects = migrationRunner.enqueue(
  "v001_create_change_requests_table",
  CREATE_CHANGE_REQUESTS_TABLE
);
export const runMigration = async () => {
  console.log("runMigration function invoked");
  try {
    await applyMigrations();
    console.log("Migrations applied successfully");
  } catch (error) {
    console.error("Error applying migrations:", error);
  }
};

export const applyMigrations = async () => {
  try {
    const successfulMigrations = await createDBObjects.run();
    console.log("Migrations applied:", successfulMigrations);
  } catch (error) {
    console.log("Error applying migrations:", error);
  }
};
