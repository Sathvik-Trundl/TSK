import Resolver from "@forge/resolver";
import {
  forgeRequestHandler,
  ResolverFunction,
} from "@toolsplus/forge-trpc-adapter";
import { resolverKey, rovoResolverKey } from "../common/constants";
import { trpcRouter } from "./router";
import { createContext } from "./trpcServer";
import { rovoRouter } from "./rovo";

const trpcResolver: ResolverFunction = forgeRequestHandler({
  router: trpcRouter,
  createContext,
});

const rovoResolver = forgeRequestHandler({
  router: rovoRouter,
  createContext,
});

export const handler = new Resolver()
  .define(resolverKey, trpcResolver)
  .define("helloWorld", () => {
    console.log("Calling helloWorld");

    return "hello world";
  })
  .getDefinitions();

export const rovoHandler = new Resolver()
  .define(rovoResolverKey, rovoResolver)
  .getDefinitions();
