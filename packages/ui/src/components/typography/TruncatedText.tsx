import type { CSSProperties, ReactNode } from "react";

interface TruncatedTextProps {
  children: ReactNode;
  /** Show full text as native tooltip on hover */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

const truncatedStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};

export function TruncatedText({ children, title, className, style }: TruncatedTextProps) {
  return (
    <span className={className} style={{ ...truncatedStyle, ...style }} title={title}>
      {children}
    </span>
  );
}
