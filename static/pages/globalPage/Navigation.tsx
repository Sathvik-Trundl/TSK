import Link from "@components/appEssentials/Link";
import Button from "@atlaskit/button/new";
import { PhoneCall, Plus } from "lucide-react";
import { globalPageStore } from "@libs/store";
const isUserLoggedIn = true;

export default function Navigation() {
  return (
    <nav className="flex items-center justify-between w-full h-12 px-4">
      <Link href="/">
        <a className="font-bold text-xl">CAB</a>
      </Link>
      <div className="flex gap-3">
        {isUserLoggedIn && (
          <Button
            appearance="discovery"
            iconBefore={(iconProps) => <PhoneCall {...iconProps} height={18} />}
          >
            Create Meet
          </Button>
        )}
        <Button
          name="Create Request"
          appearance="primary"
          iconBefore={(iconProps) => <Plus {...iconProps} height={18} />}
          onClick={() => (globalPageStore.openRequestModal = true)}
        >
          Create Request
        </Button>
      </div>
    </nav>
  );
}
