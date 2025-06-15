import { fetch } from "@forge/api";

// Step 1: Get Graph API access token using client credentials
async function getAccessToken() {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const tenantId = process.env.MS_TENANT_ID;

  console.log(
    "clientId",
    clientId,
    "clientSecret",
    clientSecret,
    "tenantId",
    tenantId
  );

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientId!);
  params.append("client_secret", clientSecret!);
  params.append("scope", "https://graph.microsoft.com/.default");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Token error response:", data);
    throw new Error(
      `Token error: ${data.error_description || JSON.stringify(data)}`
    );
  }
  return data.access_token;
}

// Step 2: Create Teams Online Meeting using Microsoft Graph API
async function createOnlineMeeting(token: string, userEmail: string) {
  const apiUrl = `https://graph.microsoft.com/v1.0/users/${userEmail}/onlineMeetings`;

  // Minimum payload; add more fields as needed
  const meetingData = {
    startDateTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min from now
    endDateTime: new Date(Date.now() + 35 * 60 * 1000).toISOString(), // 30 min duration
    subject: "Meeting from Forge App",
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meetingData),
  });

  // For deeper debugging, always log the full response text if not ok
  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  if (!response.ok) {
    console.log(text);

    console.error("Meeting creation error:", data);
    throw new Error(
      `Meeting error: ${typeof data === "string" ? data : JSON.stringify(data)}`
    );
  }
  return data;
}

// Step 3: Forge handler - orchestrates the process and handles errors
export async function run() {
  try {
    const userEmail = "sathvik.d@trundl.com"; // Change if needed

    const token = await getAccessToken();
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/users/me/mailboxSettings",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(await response.text());
    const meeting = await createOnlineMeeting(token, userEmail);
    console.log("Meeting Created:", meeting.joinWebUrl);

    return { success: true, joinUrl: meeting.joinWebUrl, meeting };
  } catch (err: any) {
    console.error("Error:", err);
    // Return the error as a readable string (in Forge, do NOT throw raw error object)
    return { success: false, error: err.message || String(err) };
  }
}
