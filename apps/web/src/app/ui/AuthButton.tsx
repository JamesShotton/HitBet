"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data, status } = useSession();

  if (status === "loading") return <span className="pill">Loading…</span>;

  if (!data?.user?.email) {
    return (
      <Link className="btn" href="/login">
        Log in
      </Link>
    );
  }

  return (
    <div className="row" style={{ gap: 10 }}>
      <Link className="btn" href="/account">Account</Link>
      <button className="btn" onClick={() => signOut()}>Log out</button>
    </div>
  );
}