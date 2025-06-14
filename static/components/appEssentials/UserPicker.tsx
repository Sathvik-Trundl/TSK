import React, { useEffect, useState } from "react";
import Select, { components } from "@atlaskit/select";
import { trpcReact } from "@trpcClient/index";

export type User = {
  accountId: string;
  displayName: string;
  avatarUrls: { [size: string]: string }; // typically 48x48 or 24x24
};

export type UserPickerProps = {
  value?: { label: string; value: string; avatar: string } | null;
  onChange?: (
    option: { label: string; value: string; avatar: string } | null
  ) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

const UserOption = (props: any) => {
  const { data, label } = props;
  return (
    <components.Option {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img
          src={data.avatar}
          alt={label}
          style={{ width: 24, height: 24, borderRadius: "50%" }}
        />
        {label}
      </div>
    </components.Option>
  );
};

const UserSingleValue = (props: any) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img
          src={data.avatar}
          alt={data.label}
          style={{ width: 20, height: 20, borderRadius: "50%" }}
        />
        {data.label}
      </div>
    </components.SingleValue>
  );
};

const UserPicker = ({
  value,
  onChange,
  placeholder = "Select user...",
  isDisabled,
}: UserPickerProps) => {
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const { data: users = [], isLoading } = trpcReact.rest.queryUsers.useQuery(
    debouncedInput,
    {
      enabled: !!debouncedInput,
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const options = users.map((user) => ({
    label: user.displayName,
    value: user.accountId,
    avatar: user.avatarUrls["24x24"] || user.avatarUrls["48x48"],
  }));

  return (
    <Select
      options={options}
      onInputChange={(val) => setInput(val)}
      onChange={onChange}
      value={value}
      isClearable
      isSearchable
      placeholder={placeholder}
      isLoading={isLoading}
      isDisabled={isDisabled}
      components={{ Option: UserOption, SingleValue: UserSingleValue }}
    />
  );
};

export default UserPicker;
