import type { ReactNode } from "react";

export const metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
