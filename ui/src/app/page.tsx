import Image from "next/image";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-4">
      <div className="flex flex-col w-full max-w-96">
        <Textarea placeholder="Say something about you and your dream job" />
        <Button className="mt-4">Submit</Button>
      </div>
      <div>
        {/* Task logging */}
        <p className="text-green-700">
          Analyzing job description...
        </p>
      </div>
    </main>
  );
}
