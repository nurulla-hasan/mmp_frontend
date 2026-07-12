import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">The page may have moved or the address may be incorrect.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button render={<Link href="/" />}>Homepage</Button>
        <Button variant="outline" render={<Link href="/tools" />}>Land Tools</Button>
        <Button variant="outline" render={<Link href="/surveyors" />}>Find a Surveyor</Button>
      </div>
    </main>
  );
}
