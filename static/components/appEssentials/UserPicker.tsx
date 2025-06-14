import React, { useState } from "react";
import Select from "@atlaskit/select";

import { trpcReact } from "@trpcClient/index";

export type UserPickerProps = React.ComponentProps<typeof Select> & {
  value?: User | null;
  onChange?: (option: User | null) => void;
  placeholder?: string;
};

// Helper to format user data into Atlaskit Select options
const formatUserOptions = (users: User[]) =>
  users.map((user) => ({
    label: user.displayName as string,
    value: user.accountId as string,
  }));

const UserPicker = ({
  value,
  onChange,
  placeholder = "Select user...",
  ...props
}: UserPickerProps) => {
  const [input, setInput] = useState<string>("");
  const { data: users, isLoading } = trpcReact.rest.queryUsers.useQuery(input, {
    enabled: !!input,
  });

  const loadOptions = async (inputValue: string) => {
    setInput(inputValue);
    return formatUserOptions(users!);
  };

  return (
    <Select
      placeholder={placeholder}
      loadOptions={loadOptions}
      isLoading={isLoading}
      onChange={onChange}
      value={value}
      isClearable
      isSearchable
      // ...other props as needed
      {...props}
    />
  );
};

export default UserPicker;
