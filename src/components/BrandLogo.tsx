import type { ReactNode } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { defaultBrand } from "@/utils/brand";

interface BrandLogoProps {
  href?: string | null;
  className?: string;
  imageClassName?: string;
  caption?: ReactNode;
  captionClassName?: string;
  layout?: "column" | "row";
}

export default function BrandLogo({
  href = APP_ROUTES.home,
  className = "",
  imageClassName = "h-16 w-auto object-contain",
  caption,
  captionClassName = "",
  layout = "column",
}: BrandLogoProps) {
  const wrapperClassName = [
    "inline-flex gap-3",
    layout === "row" ? "flex-row items-center" : "flex-col",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <img
        src={defaultBrand.logo ?? "/images/logo.png"}
        alt={`${defaultBrand.name} logo`}
        className={imageClassName}
      />
      {caption ? <div className={captionClassName}>{caption}</div> : null}
    </>
  );

  if (!href) {
    return <div className={wrapperClassName}>{content}</div>;
  }

  return (
    <Link href={href} aria-label={defaultBrand.name} className={wrapperClassName}>
      {content}
    </Link>
  );
}
