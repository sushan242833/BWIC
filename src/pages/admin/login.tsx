import AuthPage from "@/modules/auth/components/AuthPage";
import { USER_ROLE } from "@/modules/auth/types";

export default function AdminLoginPage() {
  return <AuthPage mode="login" portal={USER_ROLE.ADMIN} />;
}
