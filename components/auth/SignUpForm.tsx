"use client";

import React, { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { AuthAlert } from "./AuthAlert";
import { AuthDivider } from "./AuthDivider";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { signUp } from "@/lib/auth-client";

export interface SignUpFormProps {
  onSwitchToLogin?: () => void;
  loginHref?: string;
  onSuccess?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSwitchToLogin,
  loginHref = "/login",
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await signUp.email(
        {
          name,
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
            setError(ctx.error.message || "Failed to create account. Please try again.");
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
      title="Create Account"
      subtitle="Join us today to get started"
      footerText="Already have an account?"
      footerLinkText="Sign In"
      footerLinkHref={loginHref}
      onFooterLinkClick={onSwitchToLogin}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AuthAlert type="error" message={error} />}

        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          required
        />

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
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <AuthButton type="submit" isLoading={isLoading} variant="primary">
          Create Account
        </AuthButton>

        <AuthDivider text="Or register with" />

        <SocialAuthButtons isLoading={isLoading} />
      </form>
    </AuthCard>
  );
};

export default SignUpForm;
