import { cn } from "@libs/util";
import React from "react";

const Field: React.FC<{
  className?: string;
  htmlFor?: string;
  title: string;
}> = ({ className, htmlFor, title }) => {
  return (
    <label htmlFor={htmlFor} className={cn(className, "font-semibold text-xs")}>
      {title}
    </label>
  );
};

export default Field;
