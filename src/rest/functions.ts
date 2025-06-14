import api, {
  // storage,
  route,
} from "@forge/api";
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
  const projectsMap = new Map<string, Project>();
  for (let i = 0; i < allProjects.length; i++) {
    projectsMap.set(allProjects[i].id, allProjects[i]);
  }
  return projectsMap;
};


export const queryUsers = async(query:string)=>{
  const allUsers: User[] = await api
    .asUser()
    .requestJira(route`/rest/api/3/user/search?query=${query}`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.json());

    console.log({ allUsers });
    
  return allUsers;
}