import Navigation from "./Navigation";
import Card from "@components/globalPage/card";
import { useSnapshot } from "valtio";
import { globalPageStore } from "@libs/store";
import CABChangeRequestModal from "@components/globalPage/RequestModal";

const HomePage = () => {
  const globalSnap = useSnapshot(globalPageStore);
  const requestModalClose = () => {
    globalPageStore.openRequestModal = false;
  };
  return (
    <div className="min-h-screen px-2 py-2">
      <div className="pb-2">
        <Navigation />
      </div>
      <div className="max-w-[90%] mx-auto rounded-xl shadow-md p-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card title={"Upcoming meetings"}>
            <div>Hello</div>
          </Card>

          <Card title={"Requests status"}>
            <div>Hello</div>
          </Card>
        </div>
      </div>
      <CABChangeRequestModal isOpen={globalSnap.openRequestModal} onClose={requestModalClose} />
    </div>
  );
};

export default HomePage;
