// import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted/30 px-4 py-10">
      {/* <Logo className="mb-8" /> */}
      {children}
    </main>
  );
}
