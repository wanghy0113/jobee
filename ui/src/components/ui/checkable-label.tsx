import * as React from "react";

import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils";

export interface CheckableLabelProps {
  text: string;
  num?: number;
  isChecked?: boolean;
  onClick?: () => void;
}

const CheckableLabel = ({
  text,
  num,
  isChecked,
  onClick,
}: CheckableLabelProps) => {
  return (
    <div
      className={cn(
        "flex flex-row my-1 px-2 py-0.5 space-x-1 items-center bg-gray-200 h-6 text-xs rounded-lg cursor-pointer hover:bg-gray-300 transition-colors select-none"
      )}
      onClick={onClick}
    >
      <span className={cn("select-none")}>{text}</span>
      {num !== undefined && (
        <span className="font-bold select-none">{num}</span>
      )}
      <Checkbox checked={isChecked} />
    </div>
  );
};

export { CheckableLabel };
