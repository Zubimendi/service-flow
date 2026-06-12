import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PLATFORM_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <span className="text-lg font-bold text-primary">ServiceFlow Admin</span>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
