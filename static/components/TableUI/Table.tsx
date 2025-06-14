import * as React from "react";
import Spinner from "@atlaskit/spinner";
import { cn } from "@libs/util";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  divClassName?: string;
  border?: boolean;
  paginated?: boolean;
  isLoading?: boolean;
  sticky?: boolean;
  scrolling?: boolean;
  onDivScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      border = true,
      divClassName,
      onDivScroll,
      paginated,
      isLoading,
      sticky,
      scrolling,
      ...props
    },
    ref
  ) => (
    <div
      className={cn(
        "w-full overflow-y-auto rounded-[8px] relative",
        border && "border border-color.border",
        paginated && "rounded-b-none border-b-0",
        divClassName
      )}
      onScroll={onDivScroll}
    >
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm border-separate border-spacing-0",
          isLoading && "pointer-events-none [&>tbody]:opacity-50",
          sticky && "[&>thead]:top-0 [&>thead]:sticky [&>thead]:z-20",
          scrolling && "[&>thead]:shadow-table",
          className
        )}
        {...props}
      />
      {isLoading && (
        <div className="absolute top-1/2 right-1/2">
          <Spinner />
        </div>
      )}
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b", "bg-elevation.surface.sunken", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-elevation.surface.hovered [&:has(th)]:hover:bg-transparent",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-[40px] px-2 text-left align-middle font-medium bg-elevation.surface.sunken",
      "text-color.text.accent.gray h-[40px] border-color.border border-r border-b last:border-r-0",
      "first:rounded-tl-[8px] last:rounded-tr-[8px]",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-2 align-middle",
      "text-color.text h-[40px] border-color.border border-r border-b last:border-r-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableEmptyState: React.FC<{ colSpan: number; className?: string }> = ({
  colSpan,
  className,
  children,
}) => (
  <tr className={cn("h-[200px]", className)}>
    <td colSpan={colSpan}>
      {children ?? <div className="text-center font-semibold">No Data</div>}
    </td>
  </tr>
);
TableEmptyState.displayName = "TableEmptyState";

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmptyState,
};
