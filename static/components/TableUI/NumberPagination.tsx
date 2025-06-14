import { IconButton } from "@atlaskit/button/new";
import RefreshIcon from "@atlaskit/icon/glyph/refresh";
import Pagination from "@atlaskit/pagination";
import { cn } from "@libs/util";
import { useMemo } from "react";

type Props = {
  isFetching: boolean;
  refetch: () => void;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageIndex: number;
  total: number;
  firstElement?: React.ReactNode;
  className?: string;
};

const NumberPagination = (props: Props) => {
  const pages = useMemo(() => {
    const totalPageNumber = Math.ceil(props.total / props.pageSize);
    return Array.from({ length: totalPageNumber }, (_, i) => i + 1);
  }, [props.total, props.pageSize]);

  return (
    <div
      className={cn(
        "flex p-2 border border-color.border rounded-br-[8px] rounded-bl-[8px]",
        props.isFetching && "pointer-events-none",
        props.className
      )}
    >
      <div className="w-1/3 flex items-center">{props.firstElement}</div>
      <div className="w-1/3 flex gap-1 items-center justify-center">
        <div className="font-semibold">
          {(props.total === 0 ? 0 : 1) + props.pageSize * props.pageIndex}-
          {props.pageSize + props.pageSize * props.pageIndex > props.total
            ? props.total
            : props.pageSize + props.pageSize * props.pageIndex}{" "}
          of {props.total}
        </div>
        <IconButton
          icon={(iconProps) => <RefreshIcon {...iconProps} size="small" />}
          label="refresh"
          appearance="subtle"
          onClick={props.refetch}
          isLoading={props.isFetching}
        />
      </div>
      <div className="w-1/3 flex justify-end">
        <Pagination
          pages={pages}
          selectedIndex={props.pageIndex}
          onChange={(_, page) => props.onPageChange(page - 1)}
          isDisabled={props.isFetching || pages.length === 0}
        />
      </div>
    </div>
  );
};

export default NumberPagination;
