// pages/HomePage.tsx
import React, { useState } from "react";
import Navigation from "../../components/globalPage/Navigation";
import Card from "@components/globalPage/Card";
import { useSnapshot } from "valtio";
import { globalPageStore } from "@libs/store";
import Loader from "@components/Loader";
import StatusTable from "@components/globalPage/StatusTable";
import RequestDetailModal from "@components/globalPage/RequestDetailModal";
import CABChangeRequestModal from "@components/globalPage/CABChangeRequestModal";
import MeetingModal from "@components/globalPage/MeetingModal";
import { trpcReact } from "@trpcClient/index";
import MeetingsTable from "@components/globalPage/MeetingsTable";

const HomePage: React.FC = () => {
  const globalSnap = useSnapshot(globalPageStore);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(
    null
  );

  const {
    data: requests,
    isLoading,
    isFetching,
    refetch: refetchRequests,
  } = trpcReact.globalPage.getAllChangeRequests.useQuery();

  const { data: myMeetings } = trpcReact.globalPage.getMyMeetings.useQuery();
  const { data: upcomingMeetings } =
    trpcReact.globalPage.getTopFiveUpcomingMeetings.useQuery();

  const approveChangeRequest =
    trpcReact.globalPage.approveChangeRequest.useMutation();
  const rejectChangeRequest =
    trpcReact.globalPage.rejectChangeRequest.useMutation();

  const handleApprove = (id: string, currentPhase: Phase) => {
    approveChangeRequest.mutate(
      { id, currentPhase },
      {
        onSuccess: () => {
          refetchRequests();
          globalPageStore.openMeetModal = true;
        },
        onError: (err) => {
          console.error("Approval failed:", err);
        },
      }
    );
  };

  const handleReject = (id: string) => {
    rejectChangeRequest.mutate(id, {
      onSuccess: () => {
        refetchRequests();
      },
      onError: (err) => {
        console.error("Rejection failed:", err);
      },
    });
  };

  if (isLoading) return <Loader type="full" />;

  return (
    <div className="min-h-screen">
      <div className="pb-2">
        <Navigation />
      </div>
      <div className="max-w-[90%] mx-auto rounded-xl shadow-md p-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card title="Upcoming Meetings">
            {upcomingMeetings && (
              <MeetingsTable meetings={upcomingMeetings.results} />
            )}
          </Card>
          <Card title="My Meetings">
            {myMeetings && <MeetingsTable meetings={myMeetings.results} />}
          </Card>
          <Card title="Requests Status">
            {requests && (
              <StatusTable
                requests={requests}
                onSelect={setSelectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={isFetching}
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
        onClose={() => {
          globalPageStore.openRequestModal = false;
        }}
        refetchRequests={refetchRequests}
      />
      <MeetingModal
        isOpen={globalSnap.openMeetModal}
        onClose={() => {
          globalPageStore.openMeetModal = false;
        }}
      />
    </div>
  );
};

export default HomePage;
