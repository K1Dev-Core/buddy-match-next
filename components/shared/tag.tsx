type TagProps = {
  children: string;
  tone?: "green" | "brown" | "orange";
};

export function Tag({ children, tone = "green" }: TagProps) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}
