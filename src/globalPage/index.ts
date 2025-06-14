import { mergeRouters } from "../trpcServer";
import { changeRequest } from "./changeRequest";

export const globalPageRoute = mergeRouters(changeRequest);
