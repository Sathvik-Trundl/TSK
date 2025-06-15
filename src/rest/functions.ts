import api, { route } from "@forge/api";
// import { storageKeys } from "../../common/constants";

export const getAllProjects = async () => {
  const allProjects: Project[] = await api
    .asUser()
    .requestJira(route`/rest/api/3/project`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.json());
  const projectsMap = allProjects.reduce((acc, project) => {
    acc[project.key] = project;
    return acc;
  }, {} as Record<string, Project>);
  return projectsMap;
};

export const queryUsers = async (query: string) => {
  const allUsers: User[] = await api
    .asUser()
    .requestJira(route`/rest/api/3/user/search?query=${query}`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.json());

  const activeUsers = allUsers.filter(
    (item) => item.accountType === "atlassian" && item.active
  );

  return activeUsers;
};

export const getProjectByID = async (projectId: string | number) => {
  const projectData: Project = await api
    .asApp()
    .requestJira(route`/rest/api/3/project/${projectId}`)
    .then((res) => res.json());
  return projectData;
};

export const getUsersByIds = async (userIds: string[]) => {
  const cache = new Map<string, User>();

  const fetchUser = async (userId: string): Promise<User> => {
    if (cache.has(userId)) {
      return cache.get(userId)!;
    }
    const response = await api
      .asApp()
      .requestJira(route`/rest/api/3/user?accountId=${userId}`);
    const user = await response.json();
    cache.set(userId, user);
    return user;
  };

  const fetchAllUsers = async (userIds: string[]): Promise<User[]> => {
    const userPromises = userIds.map(fetchUser);
    return Promise.all(userPromises);
  };

  const response: User[] = await fetchAllUsers(userIds);

  return response;
};

export const queryProjects = async (query: string) => {
  const result = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/project/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    )
    .then((res) => res.json());

  const allProjects = result.values ?? [];
  console.log("queryProjects result:", allProjects);

  return allProjects as Project[];
};

export const getProjectsByIds = async (projectIds: string[]) => {
  const requests = projectIds.map((id) =>
    api
      .asUser()
      .requestJira(route`/rest/api/3/project/${id}`, {
        headers: {
          Accept: "application/json",
        },
      })
      .then((res) => res.json())
  );

  const allProjects = await Promise.all(requests);
  console.log("getProjectsByIds Success");

  return allProjects;
};

type Issue = {
  id: string;
  key: string;
  keyHtml: string;
  img: string;
  summary: string;
  summaryText: string;
  // link: string;
};

export const queryIssues = async (projectId: string, query: string) => {
  const url = route`/rest/api/3/issue/picker?currentProjectId=${projectId}&query=${query}&currentJQL=project=${projectId}`;
  const issuesSearchResponse: { sections: any[] } = await api
    .asApp()
    .requestJira(url)
    .then(async (res) => {
      if (!res.ok) {
        return [];
      }
      console.log("getProjectIssuesByQuery-rest-success ", res.status);
      return await res.json();
    })
    .catch((err) => {
      console.log("getProjectIssuesByQuery-rest-error", err);
    });

  const issues: Issue[] = Array.from(issuesSearchResponse.sections[1].issues); // actual issues

  console.log({ issues });

  return issues;
};

export const getIssuesByIds = async (issueIds: string[]) => {
  const requests = issueIds.map((id) =>
    api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${id}?fields=summary`, {
        headers: { Accept: "application/json" },
      })
      .then((res) => res.json())
  );

  const issues = await Promise.all(requests);
  console.log("getIssuesByIds result:", issues);

  return issues;
};
