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

    try {
      await signIn.email(
        {
          email,
          password,
          callbackURL: "/",
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
            if (onSuccess) onSuccess();
          },
          onError: (ctx) => {
            setIsLoading(false);
            setError(ctx.error.message || "Failed to sign in. Please try again.");
          },
        }
      );
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

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
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
