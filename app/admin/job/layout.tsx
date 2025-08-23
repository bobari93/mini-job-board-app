import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-8 sm:gap-12 lg:gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14 sm:h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-4 sm:px-5 text-sm">
            <div className="flex gap-3 sm:gap-5 items-center font-semibold">
              <Link href={"/admin/job"} className="text-sm sm:text-base font-bold text-foreground">
                Mini Job Board App
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeSwitcher />
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-4 sm:gap-8 py-8 sm:py-16 px-4">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
