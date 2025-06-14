import { initTRPC } from "@trpc/server";
import { CreateForgeContextOptions } from "@toolsplus/forge-trpc-adapter";
import superjson from "superjson";

export const createContext = ({ request }: CreateForgeContextOptions) => {
  return request.context as TrpcContext;
};

// type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;
