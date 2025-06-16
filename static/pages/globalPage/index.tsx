// pages/HomePage.tsx
import React, { useState } from "react";
import Navigation from "../../components/globalPage/Navigation";
import Card from "@components/globalPage/Card";
import { useSnapshot } from "valtio";
import { ChangeRequestFormDataState, globalPageStore } from "@libs/store";
import Loader from "@components/Loader";
import StatusTable from "@components/globalPage/StatusTable";
import RequestDetailModal from "@components/globalPage/RequestDetailModal";
import CABChangeRequestModal from "@components/globalPage/CABChangeRequestModal";
import MeetingModal from "@components/globalPage/MeetingModal";
import { trpcReact } from "@trpcClient/index";
import MeetingsTable from "@components/globalPage/MeetingsTable";
import { meetingStore } from "@libs/meetingStore";

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

  const myMeetings = trpcReact.globalPage.getMyMeetings.useQuery();
  const upcomingMeetings =
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
          const selectedRequest = requests?.find((req) => req.id === id);
          if (selectedRequest) {
            meetingStore.changeRequest = selectedRequest;
          }
          globalPageStore.openMeetModal = true;
        },
        onError: (err) => {
          console.error("Approval failed:", err);
        },
      }
    );
  };

  const handleReject = (id: string, currentPhase: string) => {
    rejectChangeRequest.mutate(
      { id, currentPhase },
      {
        onSuccess: () => {
          refetchRequests();
        },
        onError: (err) => {
          console.error("Rejection failed:", err);
        },
      }
    );
  };

  const handleEdit = (requestForm: ChangeRequestForm) => {
    globalPageStore.requestModalMode = "edit";
    globalPageStore.openRequestModal = true;

    ChangeRequestFormDataState.id = requestForm.id;
    ChangeRequestFormDataState.title = requestForm.title;
    ChangeRequestFormDataState.description = requestForm.description;
    ChangeRequestFormDataState.impact = requestForm.impact;
    ChangeRequestFormDataState.reason = requestForm.reason;
    ChangeRequestFormDataState.projectId = requestForm.projectId;
    ChangeRequestFormDataState.requestedBy = requestForm.requestedBy;
    ChangeRequestFormDataState.additionalInfo = requestForm.additionalInfo;
    ChangeRequestFormDataState.issueIds = requestForm.issueIds;
    ChangeRequestFormDataState.requiredApprovals =
      requestForm.requiredApprovals;
  };

  if (isLoading) return <Loader type="full" />;

  return (
    <div className="min-h-screen">
      <div className="pb-2">
        <Navigation />
      </div>
      <div className="max-w-[90%] mx-auto rounded-xl shadow-md p-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card
            title="Requests Status"
            onClick={refetchRequests}
            isLoading={isFetching || isLoading}
          >
            {requests && (
              <StatusTable
                requests={requests}
                onSelect={setSelectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                isLoading={isFetching}
              />
            )}
          </Card>
          <Card
            title="Upcoming Meetings"
            onClick={() => upcomingMeetings.refetch()}
            isLoading={
              upcomingMeetings.isLoading || upcomingMeetings.isFetching
            }
          >
            {upcomingMeetings.data && (
              <MeetingsTable meetings={upcomingMeetings.data.results} />
            )}
          </Card>
          <Card
            title="My Meetings"
            onClick={myMeetings.refetch}
            isLoading={myMeetings.isLoading || myMeetings.isFetching}
          >
            {myMeetings.data && (
              <MeetingsTable meetings={myMeetings.data.results} />
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
