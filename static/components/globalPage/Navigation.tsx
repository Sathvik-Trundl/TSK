import Link from "@components/appEssentials/Link";
import Button from "@atlaskit/button/new";
import { PhoneCall, Plus, Home, LayoutPanelLeft } from "lucide-react";
import { globalPageStore } from "@libs/store";
import { useLocation } from "react-router";

export default function Navigation() {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="relative flex items-center w-full h-14 px-4 bg-white border-b border-gray-100">
      {/* Left: Blue circle and TSK */}
      <div className="flex items-center z-10">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow mr-2 select-none">
          {/* Empty: Just the circle */}
        </div>
        <span className="font-bold text-lg tracking-wide text-blue-700 select-none">
          TSK
        </span>
      </div>

      {/* Center: Nav Buttons absolutely centered */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-3">
          <Link href="/">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-base transition ${
                isActive("/")
                  ? "bg-blue-50 text-blue-700 font-bold shadow"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              aria-current={isActive("/") ? "page" : undefined}
            >
              <Home size={18} /> Homepage
            </div>
          </Link>
          <Link href="/kanban">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-base transition ${
                isActive("/kanban")
                  ? "bg-blue-50 text-blue-700 font-bold shadow"
                  : "hover:bg-gray-100 text-gray-700"
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
