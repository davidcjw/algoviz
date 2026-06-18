import Link from "next/link";
import { Background } from "@/components/Background";

export default function NotFound() {
  return (
    <>
      <Background />
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="font-mono text-7xl font-extrabold text-gradient">404</p>
          <h1 className="mt-4 text-2xl font-bold">This node points to null.</h1>
          <p className="mx-auto mt-2 max-w-sm text-slate-400">
            The page you followed doesn&apos;t exist in this structure.
          </p>
          <Link
            href="/learn"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            Back to the library
          </Link>
        </div>
      </main>
    </>
  );
}
