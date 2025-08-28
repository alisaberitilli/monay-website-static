import Link from "next/link";

import { api } from "#portal/trpc/server";

import Rand from "./_components/Rand";

export default async function Home() {
  const hello = null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <Rand />
    </main>
  );
}
