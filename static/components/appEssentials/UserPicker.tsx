import { useEffect, useMemo, useState } from "react";
import Select from "@atlaskit/select";
import { trpcReact } from "@trpcClient/index";

// Types
export type AtlassianUser = {
  accountId: string;
  displayName: string;
  avatarUrls: { [size: string]: string };
};

export type UserSelectOption = {
  label: string;
  value: string;
};

export type UserPickerProps = {
  value?: string[] | null;
  onChange?: (value: string[] | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
};

// 🔁 Local Option Cache
const userOptionCache = new Map<string, UserSelectOption>();

const UserPicker = ({
  value,
  onChange,
  placeholder = "Select user...",
  isDisabled,
  isMulti = false,
  ...props
}: UserPickerProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const { data: searchResults = [], isLoading: isSearching } =
    trpcReact.rest.queryUsers.useQuery(debouncedInput, {
      enabled: !!debouncedInput,
    });

  const uncachedIds = useMemo(() => {
    if (!value || !value.length) return [];
    return value.filter((id) => !userOptionCache.has(id));
  }, [value]);

  const { data: fetchedUsers = [], isLoading: isResolving } =
    trpcReact.rest.getUsersByIds.useQuery(uncachedIds, {
      enabled: uncachedIds.length > 0,
    });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const mapToOption = (user: AtlassianUser): UserSelectOption => ({
    label: user.displayName,
    value: user.accountId,
  });

  useEffect(() => {
    searchResults.forEach((user) => {
      const option = mapToOption(user);
      if (!userOptionCache.has(option.value)) {
        userOptionCache.set(option.value, option);
      }
    });

    fetchedUsers.forEach((user) => {
      const option = mapToOption(user);
      if (!userOptionCache.has(option.value)) {
        userOptionCache.set(option.value, option);
      }
    });
  }, [searchResults, fetchedUsers]);

  const selectedOptions = useMemo(() => {
    if (!value || !value.length) return null;
    return value
      .map((id) => userOptionCache.get(id))
      .filter((opt): opt is UserSelectOption => !!opt);
  }, [value]);

  const allOptions: UserSelectOption[] = useMemo(() => {
    const seen = new Set<string>();
    const options: UserSelectOption[] = [];

    // Add from searchResults directly
    searchResults.forEach((user) => {
      const option = mapToOption(user);
      if (!seen.has(option.value)) {
        seen.add(option.value);
        options.push(option);
      }
    });

    // Add from selected values (via cache or fallback mapping)
    value?.forEach((id) => {
      const option = userOptionCache.get(id) || {
        label: id,
        value: id,
      };
      if (!seen.has(option.value)) {
        seen.add(option.value);
        options.push(option);
      }
    });

    return options;
  }, [searchResults, value]);

  const handleSelectChange = (newValue: any) => {
    if (isMulti) {
      const ids = newValue
        ? newValue.map((opt: UserSelectOption) => opt.value)
        : null;

      // Optimistically cache selected options
      newValue?.forEach((opt: UserSelectOption) => {
        if (!userOptionCache.has(opt.value)) {
          userOptionCache.set(opt.value, opt);
        }
      });

      onChange?.(ids);
    } else {
      const id = newValue?.value ?? null;

      if (newValue && !userOptionCache.has(newValue.value)) {
        userOptionCache.set(newValue.value, newValue);
      }

      onChange?.(id ? [id] : null);
    }
  };

  return (
    <Select
      isMulti={isMulti}
      options={allOptions}
      value={selectedOptions}
      onChange={handleSelectChange}
      onInputChange={(val) => setSearchInput(val)}
      isClearable
      isSearchable
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={isSearching || isResolving}
      menuPortalTarget={document.getElementById("userSelect")}
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999, // ensure it's above modals/dialogs etc.
        }),
      }}
      {...props}
    />
  );
};

export default UserPicker;
