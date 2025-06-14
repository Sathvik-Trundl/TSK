import Resolver from "@forge/resolver";
import {
  forgeRequestHandler,
  ResolverFunction,
} from "@toolsplus/forge-trpc-adapter";
import { resolverKey } from "../common/constants";
import { trpcRouter } from "./router";
import { createContext } from "./trpcServer";

const trpcResolver: ResolverFunction = forgeRequestHandler({
  router: trpcRouter,
  createContext,
});

export const handler = new Resolver()
  .define(resolverKey, trpcResolver)
  .define("helloWorld", () => {
    console.log("Calling helloWorld");

    return "hello world";
  })
  .getDefinitions();
