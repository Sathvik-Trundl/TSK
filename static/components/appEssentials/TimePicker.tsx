import React, { useState, useRef, useEffect } from "react";
import { CheckIcon } from "lucide-react";

export type TimeDropdownProps = {
  value: string; // Should be ISO "HH:mm:ss" (24-hour)
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
};

const times: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}:00`; // "HH:mm:ss"
});

// Utility to display "5:30 PM" from ISO "17:30:00"
function isoToDisplay(iso: string): string {
  const [h, m] = iso.split(":");
  if (!h || !m) return iso;
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Parse user string ("5:23 pm", "14:45", etc) → ISO "HH:mm:ss" or null
function parseToISOTime(str: string): string | null {
  let s = str.trim().toLowerCase();
  // Remove any unwanted chars except numbers, colon, am/pm
  s = s.replace(/[^0-9apm: ]/g, "");

  // Match "h:mm am/pm" or "hh:mm" or "h:mm"
  const regex = /^(\d{1,2}):(\d{2})\s*([ap]m)?$/;
  const m = s.match(regex);
  if (!m) return null;

  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const period = m[3];

  if (minute < 0 || minute > 59 || hour < 0 || hour > 23) return null;
  if (period) {
    if (hour < 1 || hour > 12) return null;
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
  }
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:00`;
}

export const TimeDropdown: React.FC<TimeDropdownProps> = ({
  value,
  onChange,
  label,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(
    value ? isoToDisplay(value) : ""
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // When value changes externally, update input display string
  useEffect(() => {
    if (!showDropdown && value) {
      setInputValue(isoToDisplay(value));
    }
    // eslint-disable-next-line
  }, [value, showDropdown]);

  useEffect(() => {
    if (showDropdown && selectedRef.current && dropdownRef.current) {
      const selected = selectedRef.current;
      const dropdown = dropdownRef.current;
      const selectedTop = selected.offsetTop;
      const selectedHeight = selected.offsetHeight;
      const dropdownHeight = dropdown.offsetHeight;
      dropdown.scrollTop =
        selectedTop - dropdownHeight / 2 + selectedHeight / 2;
    }
  }, [showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowDropdown(true);

    // Try to parse custom input on each change (only if it's not in dropdown)
    const iso = parseToISOTime(val);
    if (iso) onChange(iso);
    else onChange(""); // Invalid time clears
  };

  const handleSelect = (isoVal: string) => {
    setInputValue(isoToDisplay(isoVal));
    onChange(isoVal);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleBlur = () => setTimeout(() => setShowDropdown(false), 120);

  const handleFocus = () => {
    setShowDropdown(true);
    if (value) setInputValue(isoToDisplay(value));
  };

  // Filtering: Show all if input is empty, else fuzzy match on display label
  const filtered = !inputValue.trim()
    ? times
    : times.filter((iso) =>
        isoToDisplay(iso)
          .toLowerCase()
          .includes(inputValue.trim().toLowerCase())
      );

  // Is the current input a valid custom time not in dropdown?
  const customISO = parseToISOTime(inputValue);
  const isCustom =
    !!customISO && !times.includes(customISO) && inputValue.trim().length > 0;

  return (
    <div className="relative">
      <div
        className={`w-full flex items-center transition-all
    ${
      disabled
        ? "bg-color.background.disabled border border-color.border.disabled rounded-sm cursor-not-allowed pointer-events-none"
        : "border border-color.border.input rounded-sm bg-color.background.input appearance-none focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
    }
  `}
      >
        <input
          ref={inputRef}
          className="w-full h-[40px] px-2 bg-transparent outline-none text-sm font-normal rounded-lg"
          value={inputValue}
          placeholder={label || "Select time"}
          disabled={disabled}
          autoComplete="off"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
        <span className="mr-3 pointer-events-none text-gray-400">&#x25BC;</span>
      </div>
      {showDropdown && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-20 mt-1 w-full bg-color.background.input border-2 border-color.background.input rounded-md shadow-lg max-h-56 overflow-y-auto"
          style={{ minWidth: "12rem" }}
        >
          {filtered.map((iso) => (
            <div
              key={iso}
              ref={iso === value ? selectedRef : undefined}
              className={`flex items-center px-4 py-2 cursor-pointer transition
                ${
                  iso === value
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              onMouseDown={() => handleSelect(iso)}
            >
              <span className="flex-1">{isoToDisplay(iso)}</span>
              {iso === value && <CheckIcon className="w-2" size="small" />}
            </div>
          ))}
          {/* Allow custom value */}
          {isCustom && (
            <div
              className="flex items-center px-4 py-2 cursor-pointer transition hover:bg-blue-100 text-blue-800 font-semibold"
              onMouseDown={() => handleSelect(customISO)}
            >
              <span className="flex-1">
                {isoToDisplay(customISO)}{" "}
                <span className="ml-2 text-xs text-gray-500">(custom)</span>
              </span>
              <CheckIcon className="w-4" size="small" />
            </div>
          )}
          {/* If nothing to show */}
          {!filtered.length && !isCustom && (
            <div className="p-2 text-gray-400 text-sm">No times found</div>
          )}
        </div>
      )}
    </div>
  );
};
