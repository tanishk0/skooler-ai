import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full overflow-x-hidden p-4 sm:p-6 bg-[#FDF8F3] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4E342E]/5 via-[#FDF8F3] to-[#FDF8F3]">
      <SignUpForm />
    </div>
  );
}
