import { useEffect } from "react";
import { useRouter } from "next/router";
import { APP_ROUTES } from "@/config/routes";

const CreatePropertyPage = () => {
  const router = useRouter();

  useEffect(() => {
    void router.replace(APP_ROUTES.adminAddProperty);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8ff]">
      <p className="font-auth-headline text-lg font-semibold text-[#434655]">
        Redirecting to the admin property form...
      </p>
    </div>
  );
};

export default CreatePropertyPage;
