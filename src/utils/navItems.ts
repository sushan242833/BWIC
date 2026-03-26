import { APP_ROUTES } from "@/config/routes";

export interface NavbarItem {
  name: string;
  path: string;
}

export const navItems: NavbarItem[] = [
  { name: "Home", path: APP_ROUTES.home },
  { name: "About", path: APP_ROUTES.about },
  { name: "Properties", path: APP_ROUTES.properties },
  { name: "Recommendations", path: APP_ROUTES.recommendations },
  { name: "Contact", path: APP_ROUTES.contact },
];
