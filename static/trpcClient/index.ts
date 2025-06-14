import { createTRPCReact } from "@trpc/react-query";
import { customUiBridgeLink } from "@toolsplus/forge-trpc-link";
import superjson from "superjson";
import { resolverKey } from "@common/constants";

export const trpcReact = createTRPCReact<TrpcRouter>();
export const trpcReactClient = trpcReact.createClient({
  links: [
    customUiBridgeLink({
      resolverFunctionKey: resolverKey,
      transformer: superjson,
    }),
  ],
});
