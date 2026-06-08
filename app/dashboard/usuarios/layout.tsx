import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return <>{children}</>;
}