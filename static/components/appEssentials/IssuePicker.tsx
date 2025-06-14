import { useEffect, useMemo, useState } from "react";
import Select from "@atlaskit/select";
import { trpcReact } from "@trpcClient/index";

export type IssueSelectOption = {
  label: string; // Issue summary
  value: string; // Issue ID or key
};

export type IssuePickerProps = {
  projectId: string;
  value?: string[] | null;
  onChange?: (value: string[] | null) => void;
  isDisabled?: boolean;
  isMulti?: boolean;
  placeholder?: string;
};

const issueOptionCache = new Map<string, IssueSelectOption>();

const IssuePicker = ({
  projectId,
  value,
  onChange,
  isDisabled,
  isMulti = false,
  placeholder = "Select issues...",
}: IssuePickerProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const { data: searchResults = [], isLoading: isSearching } =
    trpcReact.rest.queryIssues.useQuery(
      { projectId, query: debouncedInput },
      { enabled: !!debouncedInput && !!projectId }
    );

  const uncachedIds = useMemo(() => {
    if (!value || !value.length) return [];
    return value.filter((id) => !issueOptionCache.has(id));
  }, [value]);

  const { data: fetchedIssues = [], isLoading: isResolving } =
    trpcReact.rest.getIssuesById.useQuery(uncachedIds, {
      enabled: uncachedIds.length > 0,
    });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const mapToOption = (issue: any) => ({
    label: `${issue.key}: ${issue.summary}`,
    value: issue.id,
  });

  useEffect(() => {
    searchResults.forEach((issue) => {
      const option = mapToOption(issue);
      if (!issueOptionCache.has(option.value)) {
        issueOptionCache.set(option.value, option);
      }
    });

    fetchedIssues.forEach((issue) => {
      const option = mapToOption(issue);
      if (!issueOptionCache.has(option.value)) {
        issueOptionCache.set(option.value, option);
      }
    });
  }, [searchResults, fetchedIssues]);

  const selectedOptions = useMemo(() => {
    if (!value?.length) return null;
    return value
      .map((id) => issueOptionCache.get(id))
      .filter((opt): opt is IssueSelectOption => !!opt);
  }, [value]);

  const allOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: IssueSelectOption[] = [];

    searchResults.forEach((issue) => {
      const opt = mapToOption(issue);
      if (!seen.has(opt.value)) {
        seen.add(opt.value);
        options.push(opt);
      }
    });

    value?.forEach((id) => {
      const opt = issueOptionCache.get(id);
      if (opt && !seen.has(opt.value)) {
        seen.add(opt.value);
        options.push(opt);
      }
    });

    return options;
  }, [searchResults, value]);

  console.log({ searchResults });

  const handleChange = (newValue: any) => {
    if (isMulti) {
      const ids = newValue?.map((opt: IssueSelectOption) => opt.value) || null;
      newValue?.forEach((opt: IssueSelectOption) => {
        if (!issueOptionCache.has(opt.value)) {
          issueOptionCache.set(opt.value, opt);
        }
      });
      onChange?.(ids);
    } else {
      const id = newValue?.value ?? null;
      if (newValue && !issueOptionCache.has(newValue.value)) {
        issueOptionCache.set(newValue.value, newValue);
      }
      onChange?.(id ? [id] : null);
    }
  };

  return (
    <Select
      isMulti={isMulti}
      options={allOptions}
      value={selectedOptions}
      onChange={handleChange}
      onInputChange={setSearchInput}
      isClearable
      isSearchable
      isDisabled={isDisabled}
      placeholder={placeholder}
      isLoading={isResolving || isSearching}
      menuPortalTarget={
        typeof window !== "undefined" ? document.body : undefined
      }
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
};

export default IssuePicker;
