import { mergeRouters } from "../trpcServer";
import { changeRequest } from "./changeRequest";
import { meetingsRouter } from "./appMeeting";

export const globalPageRoute = mergeRouters(changeRequest, meetingsRouter);
