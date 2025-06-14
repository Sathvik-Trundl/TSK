import { pageModuleKeys } from "@common/constants";
import { lazy } from "react";

const AdminPage = lazy(() => import("@appRoutes/AdminRoutes"));
const ProjectPage = lazy(() => import("@appRoutes/ProjectRoutes"));
const GlobalPage = lazy(() => import("@appRoutes/GlobalRoutes"));

type Props = {
  moduleKey: string;
};

const Module: React.FC<Props> = ({ moduleKey }) => {
  switch (moduleKey) {
    case pageModuleKeys.ADMIN_PAGE:
      return <AdminPage />;
    case pageModuleKeys.GLOBAL_PAGE:
      return <GlobalPage />;
    case pageModuleKeys.PROJECT_PAGE:
      return <ProjectPage />;
    default:
      return <div>No Context</div>;
      break;
  }
};

export default Module;
