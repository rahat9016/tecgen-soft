// components/auth/LoginForm.tsx
"use client";

import ErrorMessage from "@/src/components/shared/Errors/ErrorMessage";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import InputLabel from "@/src/components/shared/InputLabel";
import { Button } from "@/src/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { LoginFormType } from "../Schema";
import { LoginFormProps } from "../types";

export default function LoginForm({
  onSubmit,
  error,
  isPending = false,
}: LoginFormProps) {
  const methods = useFormContext<LoginFormType>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full max-w-md">
      <h2 className="text-[32px] font-semibold mb-10 text-primary">Log in</h2>
      <div className="mb-6">
        <InputLabel label="Email" required />
        <ControlledInputField
          name="email"
          type="email"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <InputLabel label="Password" required />
        <div className="relative">
          <ControlledInputField
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="pr-10"
          />
          <Button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-1 right-1 flex items-center text-black bg-transparent hover:bg-transparent shadow-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
        </div>
        <Link
          href="/forgot-password"
          className="mt-3 block text-right text-primary-light font-semibold underline"
        >
          Forgot password?
        </Link>
      </div>

      <div className="mt-3">
        <ErrorMessage error={error} />
      </div>

      <Button
        disabled={isPending}
        type="submit"
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-white"
      >
        {isPending ? "Loading..." : "Sign in"}
      </Button>

      <p className="mt-4 text-left text-sm text-[#BDBDBD]">
        Don’t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-primary-light font-medium underline"
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
}
