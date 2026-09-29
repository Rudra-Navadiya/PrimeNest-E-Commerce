
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function AdminCustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchCustomers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/customers", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load customers.");
        }

        if (active) {
          setCustomers(Array.isArray(data.customers) ? data.customers : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchCustomers();

    return () => {
      active = false;
    };
  }, [router]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.email, String(customer.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [customers, search]);

  const totalOrders = customers.reduce(
    (sum, customer) => sum + Number(customer.order_count || 0),
    0
  );

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.total_spent || 0),
    0
  );

  const averageSpend =
    customers.length > 0 ? totalRevenue / customers.length : 0;

  return (
    <main className="min-h-screen bg-[#f7f5f0] p-4 text-[#29251f] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9a8055]">
              PrimeNest Administration
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Customers
            </h1>
            <p className="mt-2 text-sm text-[#817b70]">
              View your registered customers and their order activity.
            </p>
          </div>

          
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={customers.length.toLocaleString("en-IN")}
            subtitle="Registered user accounts"
            icon="♙"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders.toLocaleString("en-IN")}
            subtitle="Orders linked by customer email"
            icon="▤"
          />
          <StatCard
            title="Total Order Value"
            value={formatCurrency(totalRevenue)}
            subtitle="Sum of customer order totals"
            icon="₹"
          />
          <StatCard
            title="Average Spend"
            value={formatCurrency(averageSpend)}
            subtitle="Per registered customer"
            icon="↗"
          />
        </section>

        {/* Customer list */}
        <section className="overflow-hidden rounded-2xl border border-[#e8e2d7] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#eee9e0] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="font-serif text-xl font-semibold">
                Customer Directory
              </h2>
              <p className="mt-1 text-sm text-[#8b857a]">
                {filteredCustomers.length} customer
                {filteredCustomers.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9388]">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or ID..."
                className="w-full rounded-xl border border-[#e5dfd4] bg-[#fbfaf7] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aaa398] focus:border-[#9b8156] focus:ring-2 focus:ring-[#9b8156]/10"
              />
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Could not load customers</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#e8e1d4] border-t-[#80663d]" />
              <p className="text-sm text-[#817b70]">Loading customers...</p>
            </div>
          ) : !error && filteredCustomers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f1e9] text-2xl text-[#92774c]">
                ♙
              </div>
              <h3 className="font-serif text-xl font-semibold">
                {search ? "No customers found" : "No customers yet"}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[#8b857a]">
                {search
                  ? "Try another name, email address or customer ID."
                  : "Registered customer accounts will appear here."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 text-sm font-semibold text-[#876b40] underline underline-offset-4"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : !error ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#faf9f6] text-[11px] uppercase tracking-[0.14em] text-[#8b857a]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    {/* <th className="px-5 py-4 font-semibold">Customer ID</th> */}
                    <th className="px-5 py-4 font-semibold">Orders</th>
                    <th className="px-5 py-4 font-semibold">Total Spend</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0ece5]">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-[#fcfbf8]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee7da] font-serif text-base font-semibold text-[#80663d]">
                            {(customer.name || customer.email || "C")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#332e27]">
                              {customer.name || "Unnamed Customer"}
                            </p>
                            <p className="mt-1 max-w-[250px] truncate text-xs text-[#8b857a]">
                              
                            </p>
                          </div>
                        </div>
                      </td>
                    
                     <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[#f3f0e9] px-3 py-1 text-xs font-semibold text-[#76613e]">
                          {Number(customer.order_count || 0)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[#393329]">
                        {formatCurrency(customer.total_spent)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="rounded-lg border border-[#ded6c8] px-4 py-2 text-xs font-semibold text-[#665333] transition hover:border-[#9a8055] hover:bg-[#f8f5ee]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="flex flex-col justify-between gap-2 border-t border-[#eee9e0] bg-[#fcfbf9] px-5 py-4 text-xs text-[#8b857a] sm:flex-row sm:items-center sm:px-6">
            <span>Customer information from your PrimeNest database.</span>
            <span>{filteredCustomers.length} displayed</span>
          </div>
        </section>
      </div>

      {/* Customer details modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCustomer(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#eee9e0] bg-[#faf9f6] p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8055]">
                  Customer Profile
                </p>
                <h2
                  id="customer-modal-title"
                  className="mt-2 font-serif text-2xl font-semibold"
                >
                  Customer Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close customer details"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfd4] text-lg text-[#716b61] transition hover:bg-[#f0ece5]"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eee7da] font-serif text-2xl font-semibold text-[#80663d]">
                  {(selectedCustomer.name || selectedCustomer.email || "C")
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-xl font-semibold">
                    {selectedCustomer.name || "Unnamed Customer"}
                  </h3>
                  <p className="mt-1 break-all text-sm text-[#817b70]">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                { <DetailCard
                  label="Customer ID"
                  value={`#${selectedCustomer.id}`}
                /> }
                
                <DetailCard
                  label="Total Orders"
                  value={Number(selectedCustomer.order_count || 0)}
                />
                <DetailCard
                  label="Total Spend"
                  value={formatCurrency(selectedCustomer.total_spent)}
                />
              </div>

              <p className="rounded-xl bg-[#f8f6f1] p-4 text-xs leading-5 text-[#817b70]">
                Order totals are matched using the customer's email address.
                This profile displays the customer fields and order summary
                returned by the admin API.
              </p>
            </div>

            <div className="flex justify-end border-t border-[#eee9e0] p-5">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl bg-[#302a22] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#514536]"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#817b70]">{title}</p>
          <p className="mt-3 break-words font-serif text-2xl font-semibold tracking-tight text-[#302a22] sm:text-3xl">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f0e8] font-serif text-xl text-[#92774c]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-[#9a9388]">{subtitle}</p>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#eee9e0] bg-white p-4">
      <p className="text-xs text-[#8b857a]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold capitalize text-[#393329]">
        {value}
      </p>
    </div>
  );
}