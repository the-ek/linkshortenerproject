import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </main>
  );
}
