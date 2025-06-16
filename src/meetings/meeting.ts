import { fetch } from "@forge/api";
//import { getSecret } from "@forge/secret";

// Step 1: Get Graph API access token
async function getAccessToken() {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const tenantId = process.env.MS_TENANT_ID;

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
  if (!response.ok) throw new Error(`Token error: ${data.error_description}`);
  return data.access_token;
}

// Step 2: Create Teams Meeting
async function createOnlineMeeting(
  token: string,
  meetingInput: MeetingsStorage,
  currentUser: string
) {
  const apiUrl = `https://graph.microsoft.com/v1.0/users/${currentUser}/events`;

  const meetingData = {
    subject: meetingInput.name,
    description: meetingInput.description,
    attendees: meetingInput.attendees,
    start: meetingInput.start,
    end: meetingInput.end,
    body: {
      contentType: "html", // or "text"
      content: meetingInput.notes || "Agenda will be shared soon.",
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meetingData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Meeting error: ${JSON.stringify(data)}`);
  return data;
}

export async function createMeeting(
  input: MeetingsStorage,
  currentUser: string
) {
  try {
    const token = await getAccessToken();
    const meeting = await createOnlineMeeting(token, input, currentUser);
    console.log("Meeting Created:", meeting.joinWebUrl);
    return { success: true, joinUrl: meeting.joinWebUrl };
  } catch (err) {
    console.error("Error:", err);
    throw { success: false, error: err };
  }
}
