import { cn } from "@/lib/utils";

export const ActionLabel = ({
  children,
  className,
  highlighted = true,
  disabled = false,
  size = "sm",
  onClick,
}: {
  children: JSX.Element | string | number | undefined | React.ReactNode;
  className?: string;
  highlighted?: boolean;
  size?: "xs" | "sm";
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <span
    className={cn(
      "bg-gray-200 font-medium max-w-44 flex flex-row space-x-1 items-center text-xs truncate select-none",
      {
        "opacity-100": highlighted,
        "opacity-30": !highlighted,
      },
      {
        "cursor-pointer": onClick !== undefined,
        "hover:bg-gray-300 transition-colors": onClick !== undefined,
      },
      {
        "h-4 mx-0.5 px-1.5 my-0.5 rounded-md": size === "xs",
        "h-6 mx-1 px-2 my-1 rounded-lg": size === "sm",
      },
      disabled && "opacity-50",
      className
    )}
    onClick={!disabled ? onClick : undefined}
  >
    {children}
  </span>
);
