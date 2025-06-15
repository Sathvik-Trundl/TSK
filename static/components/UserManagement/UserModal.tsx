import { useEffect, useState } from "react";
import Select from "@atlaskit/select";
import Button from "@atlaskit/button";
import LoadingButton from "@atlaskit/button/loading-button";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import UserPicker from "@components/appEssentials/UserPicker";
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyState,
} from "@components/TableUI/Table";
import NumberPagination from "@components/TableUI/NumberPagination";
import { trpcReact } from "@trpcClient/index";
import { DateTime } from "luxon";

type UserManagementPerUser = {
  id: string;
  userLabel: string;
  avatarUrl?: string;
  projectRoles: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

const roles = ["Admin", "Approver", "User"];

const UserModal = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [permissions, setPermissions] = useState<UserManagementPerUser[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string[] | null>(null);
  const [resolvedUser, setResolvedUser] = useState<{
    label: string;
    avatarUrl?: string;
  } | null>(null);
  const [projectRoles, setProjectRoles] = useState<any[]>([]);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 5;

  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const projectData = trpcReact.rest.getAllProjects.useQuery();
  const getAllUsers = trpcReact.admin.getAllUsers.useQuery();
  const createUser = trpcReact.admin.createUser.useMutation();
  const updateUser = trpcReact.admin.updateUser.useMutation();
  const deleteUser = trpcReact.admin.deleteUser.useMutation();

  const { data: resolvedUsers } = trpcReact.rest.getUsersByIds.useQuery(
    selectedUser ?? [],
    {
      enabled: !!selectedUser?.length,
    }
  );

  useEffect(() => {
    if (projectData.data) {
      setProjects(Object.values(projectData.data));
    }
  }, [projectData.data]);

  useEffect(() => {
    if (getAllUsers.data) {
      setPermissions(getAllUsers.data.results ?? []);
    }
  }, [getAllUsers.data]);

  useEffect(() => {
    if (resolvedUsers?.length) {
      const user = resolvedUsers[0];
      setResolvedUser({
        label: user.displayName,
        avatarUrl: user.avatarUrls["24x24"] || user.avatarUrls["48x48"],
      });
    }
  }, [resolvedUsers]);

  const resetForm = () => {
    setSelectedUser(null);
    setResolvedUser(null);
    setProjectRoles([]);
    setTouched(false);
    setEditUserId(null);
    setIsSubmitting(false);
  };

  const isFormValid =
    selectedUser &&
    selectedUser.length > 0 &&
    projectRoles.length > 0 &&
    projectRoles.every((pr) => pr.project && pr.role);

  const handleSubmit = () => {
    setTouched(true);
    if (!isFormValid || !resolvedUser) return;

    setIsSubmitting(true);

    const now = DateTime.now().toISO();
    const projectRolesMap = projectRoles.reduce(
      (acc: Record<string, string>, curr: any) => {
        acc[curr.project.value] = curr.role.value;
        return acc;
      },
      {}
    );

    const payload: UserManagementPerUser = {
      id: selectedUser?.[0] ?? "",
      userLabel: resolvedUser.label,
      avatarUrl: resolvedUser.avatarUrl,
      projectRoles: projectRolesMap,
      createdAt: now,
      updatedAt: now,
    };

    const mutation = editUserId ? updateUser : createUser;
    mutation.mutate(payload, {
      onSuccess: () => {
        getAllUsers.refetch();
        setModalOpen(false);
        resetForm();
      },
      onSettled: () => setIsSubmitting(false),
    });
  };

  const handleEdit = (userId: string) => {
    const userEntry = permissions.find((p) => p.id === userId);
    if (!userEntry) return;

    const prefilled = Object.entries(userEntry.projectRoles).map(
      ([projectId, role]) => {
        const projectName =
          projects.find((p) => p.id === projectId)?.name || projectId;
        return {
          project: {
            value: projectId,
            label: projectName,
          },
          role: {
            value: role,
            label: role,
          },
        };
      }
    );

    setSelectedUser([userEntry.id]);
    setResolvedUser({
      label: userEntry.userLabel,
      avatarUrl: userEntry.avatarUrl,
    });

    setProjectRoles(prefilled);
    setEditUserId(userId);
    setTouched(false);
    setModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setIsDeleting(true);
    deleteUser.mutate(userId, {
      onSuccess: () => {
        getAllUsers.refetch();
        setDeleteConfirmUserId(null);
      },
      onSettled: () => setIsDeleting(false),
    });
  };

  const toggleExpand = (userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  const addProjectRole = () => {
    setProjectRoles((prev) => [...prev, { project: null, role: null }]);
  };

  const updateProjectRole = (
    index: number,
    field: "project" | "role",
    value: any
  ) => {
    const updated = [...projectRoles];
    updated[index][field] = value;
    setProjectRoles(updated);
  };

  const removeProjectRole = (index: number) => {
    const updated = [...projectRoles];
    updated.splice(index, 1);
    setProjectRoles(updated);
  };

  const selectedProjectIds = projectRoles
    .map((pr) => pr.project?.value)
    .filter(Boolean);

  return (
    <div className="p-6 text-sm">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">User Role Permissions</h2>
        <Button appearance="primary" onClick={() => setModalOpen(true)}>
          Create
        </Button>
      </div>

      <ModalTransition>
        {modalOpen && (
          <Modal
            shouldScrollInViewport
            onClose={() => {
              resetForm();
              setModalOpen(false);
            }}
          >
            <ModalHeader>
              <ModalTitle>
                {editUserId ? "Edit" : "Create"} Permissions
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-medium block mb-1">User</label>
                  <UserPicker
                    value={selectedUser}
                    onChange={setSelectedUser}
                    placeholder="Select user"
                    isDisabled={!!editUserId}
                  />
                  {touched && !selectedUser && (
                    <div className="text-red-500 text-xs mt-1">
                      User is required
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-medium">Projects & Roles</label>
                  {projectRoles.map((entry, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                    >
                      <Select
                        options={projects
                          .filter(
                            (p) =>
                              !selectedProjectIds.includes(p.id) ||
                              entry.project?.value === p.id
                          )
                          .map((p) => ({
                            label: p.name,
                            value: p.id,
                          }))}
                        value={entry.project}
                        onChange={(val: any) => {
                          updateProjectRole(index, "project", val);
                        }}
                        placeholder="Select project"
                      />
                      <Select
                        options={roles.map((r) => ({
                          label: r,
                          value: r,
                        }))}
                        value={entry.role}
                        onChange={(val: any) =>
                          updateProjectRole(index, "role", val)
                        }
                        placeholder="Select role"
                      />
                      <Button
                        spacing="none"
                        appearance="subtle"
                        onClick={() => removeProjectRole(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button appearance="default" onClick={addProjectRole}>
                    + Add Project
                  </Button>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                appearance="default"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                appearance="primary"
                isLoading={isSubmitting}
                onClick={handleSubmit}
                isDisabled={!isFormValid}
              >
                {editUserId ? "Update" : "Create"}
              </LoadingButton>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

      <Table paginated sticky divClassName="overflow-y-visible">
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Project-Role Mapping</TableHead>
            <TableHead style={{ width: "180px" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.length === 0 ? (
            <TableEmptyState colSpan={3}>
              <div className="flex justify-center items-center h-[100px]">
                No data
              </div>
            </TableEmptyState>
          ) : (
            permissions
              .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
              .map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.avatarUrl && (
                        <img
                          src={entry.avatarUrl}
                          alt="avatar"
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      {entry.userLabel}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer flex items-center gap-1"
                      onClick={() => toggleExpand(entry.id)}
                    >
                      {expandedUserId === entry.id ? (
                        <ChevronDownIcon />
                      ) : (
                        <ChevronRightIcon />
                      )}
                      <span className="text-muted">Click to view</span>
                    </div>
                    <div
                      className={`transition-all overflow-hidden duration-300 ${
                        expandedUserId === entry.id
                          ? "max-h-[200px]"
                          : "max-h-0"
                      }`}
                    >
                      <ul className="pl-4 py-2 list-disc text-sm">
                        {expandedUserId === entry.id &&
                          Object.entries(entry.projectRoles).map(
                            ([projectId, role]) => {
                              const projectName =
                                projects.find((p) => p.id === projectId)
                                  ?.name || projectId;
                              return (
                                <li key={projectId}>
                                  <strong>{projectName}</strong>: {role}
                                </li>
                              );
                            }
                          )}
                      </ul>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        appearance="default"
                        onClick={() => handleEdit(entry.id)}
                      >
                        Edit
                      </Button>
                      <LoadingButton
                        appearance="danger"
                        isLoading={
                          isDeleting && deleteConfirmUserId === entry.id
                        }
                        onClick={() => setDeleteConfirmUserId(entry.id)}
                      >
                        Delete
                      </LoadingButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>

      <NumberPagination
        isFetching={getAllUsers.isFetching}
        refetch={() => getAllUsers.refetch()}
        pageIndex={pageIndex}
        onPageChange={(page) => setPageIndex(page)}
        pageSize={pageSize}
        total={permissions.length}
      />

      <ModalTransition>
        {deleteConfirmUserId && (
          <Modal onClose={() => setDeleteConfirmUserId(null)}>
            <ModalHeader>
              <ModalTitle>Confirm Deletion</ModalTitle>
            </ModalHeader>
            <ModalBody>Are you sure you want to delete this user?</ModalBody>
            <ModalFooter>
              <Button
                appearance="default"
                onClick={() => setDeleteConfirmUserId(null)}
              >
                Cancel
              </Button>
              <LoadingButton
                appearance="danger"
                isLoading={isDeleting}
                onClick={() => handleDeleteUser(deleteConfirmUserId)}
              >
                Delete
              </LoadingButton>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </div>
  );
};

export default UserModal;
