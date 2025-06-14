import { lazy, Suspense } from "react";
import Loader from "@components/Loader";
import { useProductContext } from "@libs/util";
import "@css/app.css";

const Module = lazy(() => import("@components/appEssentials/Module"));

const App = () => {
  const getContext = useProductContext();

  if (getContext.isLoading) return <Loader type="full" />;
  if (!getContext.data) return <div>Cannot Detect Context</div>;

  return (
    <Suspense fallback={<Loader type="full" />}>
      <Module moduleKey={getContext.data.moduleKey} />
    </Suspense>
  );
};

export default App;

