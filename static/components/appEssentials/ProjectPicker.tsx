import { useEffect, useMemo, useState } from "react";
import Select from "@atlaskit/select";
import { trpcReact } from "@trpcClient/index";

// Types
export type AtassianProject = {
  id: string;
  name: string;
  key: string;
  avatarUrls: { [size: string]: string };
};

export type ProjectOption = {
  label: string;
  value: string;
};

export type ProjectProps = {
  value?: string[] | null;
  onChange?: (value: string[] | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
};

// 🔁 Local Option Cache
const optionCache = new Map<string, ProjectOption>();

const ProjectPicker = ({
  value,
  onChange,
  placeholder = "Select Project...",
  isDisabled,
  isMulti = false,
}: ProjectProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const { data: searchResults = [], isLoading: isSearching } =
    trpcReact.rest.queryProjects.useQuery(debouncedInput, {
      enabled: !!debouncedInput,
    });

  const uncachedIds = useMemo(() => {
    if (!value || !value.length) return [];
    return value.filter((id) => !optionCache.has(id));
  }, [value]);

  const { data: fetchProjects = [], isLoading: isResolving } =
    trpcReact.rest.getProjectsById.useQuery(uncachedIds, {
      enabled: uncachedIds.length > 0,
    });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const mapToOption = (project: AtassianProject): ProjectOption => ({
    label: project.name + " - " + project.key,
    value: project.id,
  });

  useEffect(() => {
    searchResults.forEach((project) => {
      const option = mapToOption(project);
      if (!optionCache.has(option.value)) {
        optionCache.set(option.value, option);
      }
    });

    fetchProjects.forEach((project) => {
      const option = mapToOption(project);
      if (!optionCache.has(option.value)) {
        optionCache.set(option.value, option);
      }
    });
  }, [searchResults, fetchProjects]);

  const selectedOptions = useMemo(() => {
    if (!value || !value.length) return null;
    return value
      .map((id) => optionCache.get(id))
      .filter((opt): opt is ProjectOption => !!opt);
  }, [value]);

  const allOptions: ProjectOption[] = useMemo(() => {
    const seen = new Set<string>();
    const options: ProjectOption[] = [];

    // Add from searchResults directly
    searchResults.forEach((project) => {
      const option = mapToOption(project);
      if (!seen.has(option.value)) {
        seen.add(option.value);
        options.push(option);
      }
    });

    // Add from selected values (via cache or fallback mapping)
    value?.forEach((id) => {
      const option = optionCache.get(id) || {
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
        ? newValue.map((opt: ProjectOption) => opt.value)
        : null;

      // Optimistically cache selected options
      newValue?.forEach((opt: ProjectOption) => {
        if (!optionCache.has(opt.value)) {
          optionCache.set(opt.value, opt);
        }
      });

      onChange?.(ids);
    } else {
      const id = newValue?.value ?? null;

      if (newValue && !optionCache.has(newValue.value)) {
        optionCache.set(newValue.value, newValue);
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
      menuPortalTarget={document.getElementById("projectSelect")}
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999, // ensure it's above modals/dialogs etc.
        }),
      }}
    />
  );
};

export default ProjectPicker;
