import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/animated-logo";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <AnimatedLogo />
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mt-6">
          ILBooks
        </h1>
        <p className="mt-2 text-xl text-red-800 font-headline tracking-wider">
          [ I Love Books ]
        </p>
        <p className="mt-12 text-2xl md:text-3xl font-headline text-foreground max-w-2xl">
          Welcome to the Bookworm Network, a place for readers to connect, compete, and discover.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Button asChild size="lg" className="font-headline">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" className="font-headline bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
