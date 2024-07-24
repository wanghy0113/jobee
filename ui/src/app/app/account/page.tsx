"use client";

import { useSession } from "@/app/context/session-context";
import { Button } from "@/components/ui/button";

function Login() {
  return (
    <div>
      <Button
        onClick={() => {
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
        }}
      >
        Login with Google
      </Button>
    </div>
  );
}

export default function Page() {
  const { session } = useSession();

  return (
    <div>
      <h1>Account</h1>
      {session?.user?.email && <p>Logged in as {session?.user?.email}</p>}
      {!session?.user?.email && <Login />}
    </div>
  );
}
