import { requestJira } from "@forge/bridge";

export const getProjectIssues = async (projectKey: string) => {
  console.log(`getProjectIssues: ${projectKey}`);

  const response = await requestJira(
    `/rest/api/3/search/jql?jql=project=${projectKey}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  console.log(`Response: ${response.status} ${response.statusText}`);
  console.log(await response.json());
};
