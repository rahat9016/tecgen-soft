"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { isAdminRole } from "@/src/utils/UserRoleEnum";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import LoginForm from "./Form/LoginForm";
import LoginBanner from "./LoginBanner";
import { LoginFormType, loginSchema } from "./Schema";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<LoginFormType>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    mutateAsync: login,
    isPending,
    error,
  } = useAuth((role: string) => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      router.push(redirect);
    } else if (isAdminRole(role)) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  });

  const onSubmit = (data: LoginFormType) => {
    login(data).then(() => {
      methods.reset();
    });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center px-6">
        <FormProvider {...methods}>
          <LoginForm onSubmit={onSubmit} error={error} isPending={isPending} />
        </FormProvider>
      </div>
      <LoginBanner />
    </div>
  );
}
