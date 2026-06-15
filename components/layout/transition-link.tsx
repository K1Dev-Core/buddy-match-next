"use client";

import Link, { LinkProps } from "next/link";
import { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

type TransitionLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
};

export function TransitionLink({
  children,
  className,
  href,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.push(typeof href === "string" ? href : href.toString());
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
