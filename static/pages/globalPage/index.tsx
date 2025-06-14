// pages/HomePage.tsx
import React, { useState } from "react";
import Navigation from "./Navigation";
import Card from "@components/globalPage/Card";
import { useSnapshot } from "valtio";
import { globalPageStore } from "@libs/store";
// import { trpcReact } from "@trpcClient/index";
// import Loader from "@components/Loader";
import StatusTable from "@components/globalPage/StatusTable";
import RequestDetailModal from "@components/globalPage/RequestDetailModal";
import CABChangeRequestModal from "@components/globalPage/CABChangeRequestModal";
import { dummyChangeRequests } from "./changeRequestsData";

const HomePage: React.FC = () => {
  const globalSnap = useSnapshot(globalPageStore);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(
    null
  );

  // const { data: requests, isLoading } =
  //   trpcReact.globalPage.getAllChangeRequests.useQuery();

  const requests = dummyChangeRequests

  const handleApprove = (id: string) => {
    console.log(id);
  };

  const handleReject = (id: string) => {
    console.log(id);
  };

  // if (isLoading) return <Loader type="full" />;

  console.log(requests);

  return (
    <div className="min-h-screen px-2 py-2">
      <div className="pb-2">
        <Navigation />
      </div>
      <div className="max-w-[90%] mx-auto rounded-xl shadow-md p-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card title="Upcoming Meetings">
            <div>Hello</div>
          </Card>
          <Card title="Requests Status">
            {requests && (
              <StatusTable
                requests={requests}
                onSelect={setSelectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
          </Card>
        </div>
      </div>
      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
      <CABChangeRequestModal
        isOpen={globalSnap.openRequestModal}
        onClose={() => (globalPageStore.openRequestModal = false)}
      />
    </div>
  );
};

export default HomePage;
