
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";

export const metadata = {
  title: "Settings | PrimeNest Admin",
};

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("primenest-session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  let session;

  try {
    session = await verifySessionToken(token);
  } catch {
    redirect("/admin/login");
  }

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const settings = [
    {
      title: "Store Name",
      value: "PrimeNest",
      description: "Your e-commerce store name.",
    },
    {
      title: "Currency",
      value: "INR (₹)",
      description: "The currency used for store prices.",
    },
    {
      title: "Account Role",
      value: "Administrator",
      description: "Your current access level.",
    },
    {
      title: "Session Security",
      value: "HTTP-only session cookie",
      description: "Your admin session is stored in a protected cookie.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#a98952]">
              PrimeNest Administration
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#29251f]">
              Settings
            </h1>
            <p className="mt-2 text-sm text-[#777064]">
              View your administrator account and store configuration.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-[#ded8cc] bg-white px-5 py-3 text-sm font-medium text-[#29251f] transition hover:bg-[#f1eee8]"
          >
            ← Back to Dashboard
          </Link>
        </header>

        <section className="mb-6 rounded-2xl border border-[#e8e3d9] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3eee4] font-serif text-2xl font-bold text-[#a98952]">
              A
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#29251f]">
                Administrator Account
              </h2>
              <p className="text-sm text-[#777064]">
                Signed in to PrimeNest Admin
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f8f6f2] p-4">
              <p className="mb-1 text-xs text-[#777064]">Account Email</p>
              <p className="break-all font-medium text-[#29251f]">
                {session.email || "Admin account"}
              </p>
            </div>

            <div className="rounded-xl bg-[#f8f6f2] p-4">
              <p className="mb-1 text-xs text-[#777064]">Access Role</p>
              <p className="font-medium text-[#29251f]">
                {session.role}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8e3d9] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-serif text-2xl font-bold text-[#29251f]">
              Store Configuration
            </h2>
            <p className="mt-1 text-sm text-[#777064]">
              Current PrimeNest store information.
            </p>
          </div>

          <div className="divide-y divide-[#eee9e0]">
            {settings.map((item) => (
              <div
                key={item.title}
                className="flex flex-wrap items-center justify-between gap-3 py-5"
              >
                <div>
                  <h3 className="font-medium text-[#29251f]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#777064]">
                    {item.description}
                  </p>
                </div>

                <span className="rounded-lg bg-[#f3eee4] px-3 py-2 text-sm font-medium text-[#765c32]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-5 text-xs text-[#8b8478]">
          These settings are currently informational. Editing and saving
          configuration values can be added after connecting a settings
          database.
        </p>
      </div>
    </main>
  );
}