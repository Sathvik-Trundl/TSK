import ReactDOM from "react-dom/client";
import { lazy, Suspense } from "react";
import { view } from "@forge/bridge";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { trpcReactClient, trpcReact } from "@trpcClient/index";
import "./global.css";

view.theme.enable();

const App = lazy(() => import("./App"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <trpcReact.Provider client={trpcReactClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </trpcReact.Provider>
);

