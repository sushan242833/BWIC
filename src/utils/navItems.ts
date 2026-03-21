// navItems.ts
export interface NavbarItem {
  name: string;
  path: string;
}

export const navItems: NavbarItem[] = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Properties", path: "/properties" },
  { name: "Recommendations", path: "/recommendations" },
  { name: "Contact", path: "/contact" },
];
