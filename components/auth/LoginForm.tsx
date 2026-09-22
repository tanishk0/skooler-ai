"use client";

import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { AuthAlert } from "./AuthAlert";
import { AuthDivider } from "./AuthDivider";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { signIn } from "@/lib/auth-client";

export interface LoginFormProps {
  onSwitchToSignUp?: () => void;
  signUpHref?: string;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignUp,
  signUpHref = "/signup",
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const destination =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("callbackUrl") || "/"
        : "/";

    try {
      const res = await signIn.email(
        {
          email,
          password,
          callbackURL: destination,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
            if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = destination;
            }
          },
          onError: (ctx) => {
            setIsLoading(false);
            setError(ctx.error.message || "Failed to sign in. Please try again.");
          },
        }
      );

      if (res?.data && !res?.error) {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = destination;
        }
      } else if (res?.error) {
        setIsLoading(false);
        setError(res.error.message || "Failed to sign in. Please try again.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      footerLinkHref={signUpHref}
      onFooterLinkClick={onSwitchToSignUp}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AuthAlert type="error" message={error} />}

        <AuthInput
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-[#8D6E63] hover:text-[#4E342E] transition-colors">
            <input
              type="checkbox"
              className="rounded border-[#4E342E]/20 text-[#4E342E] focus:ring-[#4E342E]/20 accent-[#4E342E]"
            />
            Remember me
          </label>
        </div>

        <AuthButton type="submit" isLoading={isLoading} variant="primary">
          Sign In
        </AuthButton>

        <AuthDivider text="Or continue with" />

        <SocialAuthButtons isLoading={isLoading} />
      </form>
    </AuthCard>
  );
};

export default LoginForm;
