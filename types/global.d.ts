import { trpcRouter } from "../src/router";
import { type FullContext } from "@forge/bridge/out/types";

declare global {
  type TrpcRouter = typeof trpcRouter;

  type TrpcContext = FullContext;
}

export {};
