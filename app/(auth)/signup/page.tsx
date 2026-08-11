import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-screen p-4 sm:p-6 bg-[#f9fafb] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/70 via-[#f9fafb] to-[#f9fafb]">
      <SignUpForm />
    </div>
  );
}
