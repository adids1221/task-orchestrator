import { type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
