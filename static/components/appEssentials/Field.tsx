import React from "react";

/**
 * A wrapper around a form field that provides a consistent layout and optional
 * label and error text.
 */
export type FieldProps = {
  className?: string;
  htmlFor?: string;
  title?: string;
  label?: string;
  error?: string;
  children: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({
  className,
  htmlFor,
  title,
  label,
  error,
  children,
}) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="font-semibold text-xs mb-2 block">
      {label || title}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

export default Field;
