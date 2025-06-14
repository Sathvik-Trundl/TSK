import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Router, Routes } from "react-router";
import { view } from "@forge/bridge";
import Loader from "@components/Loader";

const HomePage = lazy(() => import("@pages/projectPage"));

export default function ProjectPage() {
  const [history, setHistory] = useState<any>(null);
  const [historyState, setHistoryState] = useState<any>(null);

  useEffect(() => {
    view
      .createHistory()
      .then((newHistory) => {
        setHistory(newHistory);
      })
      .catch((err) => {
        console.log("view-history-adminPage-error", err);
      });
  }, []);

  useEffect(() => {
    if (!historyState && history) {
      setHistoryState({
        action: history.action,
        location: history.location,
      });
    }
  }, [history, historyState]);

  useEffect(() => {
    if (history) {
      history.listen((location: any, action: any) => {
        setHistoryState({
          action,
          location,
        });
      });
    }
  }, [history]);

  if (!(history && historyState)) return <Loader type="full" />;

  return (
    <Router
      navigator={history}
      navigationType={historyState.action}
      location={historyState.location}
    >
      <Routes>
        <Route
          path={"/"}
          element={
            <Suspense fallback={<Loader type="full" />}>
              <HomePage />
            </Suspense>
          }
        ></Route>
      </Routes>
    </Router>
  );
}
