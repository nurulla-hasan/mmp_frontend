import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Land Tools", href: "/tools" },
  { label: "Find Surveyor", href: "/surveyors" },
  { label: "Services", href: "/services" },
  { label: "Guides", href: "/service-guides" },
  { label: "Community", href: "/community" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="ml-auto hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {publicLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <ThemeToggle />
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>Login</Button>
          <Button className="hidden sm:inline-flex" nativeButton={false} render={<Link href="/surveyors" />}>Find a Surveyor</Button>
          <details className="relative lg:hidden">
            <summary className="cursor-pointer list-none rounded-md border px-3 py-1.5 text-sm">Menu</summary>
            <nav className="absolute right-0 mt-2 grid w-56 gap-1 rounded-xl border bg-popover p-2 shadow-md" aria-label="Mobile navigation">
              {publicLinks.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm hover:bg-accent">{item.label}</Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
