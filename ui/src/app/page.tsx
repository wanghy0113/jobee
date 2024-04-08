import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to your Next.js app</h1>
      <Image
        src="/nextjs-logo.png"
        alt="Next.js logo"
        width={200}
        height={200}
        className="rounded-full"
      />
      <p className="text-lg text-center">
        Get started by editing <code>pages/index.tsx</code>
      </p>
    </main>
  );
}
