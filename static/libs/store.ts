import { proxy } from "valtio";

export const globalPageStore = proxy({
  openMeetModal: false,
  openRequestModal: false,
});
