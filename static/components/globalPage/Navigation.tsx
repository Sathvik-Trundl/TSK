import Link from "@components/appEssentials/Link";
import Button from "@atlaskit/button/new";
import { PhoneCall, Plus, Home, LayoutPanelLeft } from "lucide-react";
import { globalPageStore } from "@libs/store";
import { useLocation } from "react-router";

export default function Navigation() {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="relative flex items-center w-full h-14 px-4 border-b border-gray-100">
      {/* Left: Blue circle and TSK */}
      <div className="flex items-center z-10">
        <div className="w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg shadow mr-2 select-none bg-white">
          <img src="./logo.png" />
        </div>
        <span className="font-bold text-lg tracking-wide text-[#9d70e7] select-none">
          TPK
        </span>
      </div>

      {/* Center: Nav Buttons absolutely centered */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-3">
          <Link href="/">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-base transition-all duration-300 ease-in-out  
          ${
            isActive("/")
              ? "bg-blue-50 dark:bg-blue-500/40 text-blue-700 dark:text-white font-bold shadow"
              : "hover:bg-gray-100 text-gray-700 dark:hover:bg-blue-500/40 dark:text-white ring-1 border-elevation.surface"
          }`}
              aria-current={isActive("/") ? "page" : undefined}
            >
              <Home size={18} /> Homepage
            </div>
          </Link>
          <Link href="/kanban">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-base transition-all duration-300 ease-in-out
          ${
            isActive("/kanban")
              ? "bg-blue-50 dark:bg-blue-500/40 text-blue-700 dark:text-white font-bold shadow"
              : "hover:bg-gray-100 text-gray-700 dark:hover:bg-blue-500/40 dark:text-white ring-1 border-elevation.surface"
          }`}
              aria-current={isActive("/kanban") ? "page" : undefined}
            >
              <LayoutPanelLeft size={18} /> Kanban Board
            </div>
          </Link>
        </div>
      </div>

      {/* Right: Actions */}
      {location.pathname == "/" && (
        <div className="flex items-center gap-3 ml-auto z-10">
          <Button
            appearance="discovery"
            iconBefore={(iconProps) => <PhoneCall {...iconProps} size={18} />}
            onClick={() => {
              globalPageStore.openMeetModal = true;
            }}
          >
            Create Meet
          </Button>
          <Button
            name="Create Request"
            appearance="primary"
            iconBefore={(iconProps) => <Plus {...iconProps} size={18} />}
            onClick={() => {
              globalPageStore.openRequestModal = true;
              globalPageStore.requestModalMode = "create";
            }}
          >
            Create Request
          </Button>
        </div>
      )}
    </nav>
  );
}
