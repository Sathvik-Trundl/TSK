import { lazy, Suspense, useEffect, useState } from "react";
import { view } from "@forge/bridge";
import Loader from "@components/Loader";
import { Route, Router, Routes } from "react-router";

const HomePage = lazy(() => import("@pages/globalPage"));
const KanbanBoard = lazy(() => import("@pages/globalPage/KanbanBoard"));

const globalPageRoutes = [
  {
    path: "/",
    component: <HomePage />,
  },
  {
    path: "/kanban",
    component: <KanbanBoard />,
  },
];

export default function AdminPage() {
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
        {globalPageRoutes.map((route) => (
          <Route
            path={route.path}
            element={
              <Suspense fallback={<Loader type="full" />}>
                {route.component}
              </Suspense>
            }
          ></Route>
        ))}
      </Routes>
    </Router>
  );
}
