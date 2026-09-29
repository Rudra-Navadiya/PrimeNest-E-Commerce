
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/stats", {
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Unable to load analytics.");
        }

        if (active) setStats(data);
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [router]);

  const monthlyRevenue = useMemo(() => {
    const source = stats?.monthlyRevenue;
    if (!Array.isArray(source)) return [];

    return source.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue) || 0,
    }));
  }, [stats]);

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );

  const totalMonthlyRevenue = monthlyRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const orders = Array.isArray(stats?.latestOrders)
    ? stats.latestOrders
    : [];

  const orderStatuses = useMemo(() => {
    const counts = {};

    orders.forEach((order) => {
      const status = String(order.status || "pending").toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [orders]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e8e1d4] border-t-[#80663d]" />
          <p className="mt-4 text-sm text-[#817b70]">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0] p-5">
        <div className="w-full max-w-md rounded-2xl border border-[#e8e2d7] bg-white p-7 text-center shadow-sm">
          <h1 className="font-serif text-2xl font-semibold">
            Analytics unavailable 
          </h1>
          <p className="mt-3 text-sm text-[#817b70]">
            {error || "No analytics data was returned."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-[#302a22] px-5 py-3 text-sm font-semibold text-white hover:bg-[#514536]"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="ml-2 mt-5 rounded-xl border border-[#ded8cc] px-5 py-3 text-sm font-semibold text-[#514536] hover:bg-[#f7f5f0]"
          >
            Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] p-4 text-[#29251f] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page heading */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9a8055]">
              PrimeNest Administration
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Analytics & Reports
            </h1>
            <p className="mt-2 text-sm text-[#817b70]">
              Monitor your store performance and sales activity.
            </p>
          </div>

        <a
          href="/api/admin/reports/export"
          className="w-fit rounded-xl border border-[#a98952] bg-[#a98952] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927344]"
        >
          ↓ Export Orders CSV
        </a>
      </header>

        {/* Key metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Sales"
            value={currency(stats.totalSales)}
            description="Recorded order revenue"
            icon="₹"
          />
          <MetricCard
            title="Total Orders"
            value={number(stats.orderCount)}
            description="All store orders"
            icon="▤"
          />
          <MetricCard
            title="Customers"
            value={number(stats.userCount)}
            description="Registered customer accounts"
            icon="♙"
          />
          <MetricCard
            title="Products"
            value={number(stats.productCount)}
            description="Products in your catalogue"
            icon="◇"
          />
        </section>

        {/* Revenue chart */}
        <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8055]">
                Revenue overview
              </p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">
                Monthly Revenue
              </h2>
              <p className="mt-1 text-sm text-[#817b70]">
                Revenue by month for the current calendar year.
              </p>
            </div>
            <div className="rounded-xl bg-[#f6f2e9] px-4 py-3">
              <p className="text-xs text-[#817b70]">Revenue shown</p>
              <p className="mt-1 text-xl font-semibold text-[#6f5734]">
                {currency(totalMonthlyRevenue)}
              </p>
            </div>
          </div>

          {monthlyRevenue.length > 0 ? (
            <div className="mt-8">
              <div className="flex h-64 items-end gap-2 border-b border-l border-[#e9e3d8] px-2 sm:gap-4 sm:px-5">
                {monthlyRevenue.map((item, index) => {
                  const height =
                    item.revenue > 0
                      ? Math.max((item.revenue / maxRevenue) * 100, 3)
                      : 0;

                  return (
                    <div
                      key={`${item.month}-${index}`}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-2 hidden max-w-full truncate text-[10px] text-[#817b70] sm:block">
                        {item.revenue > 0 ? currency(item.revenue) : ""}
                      </span>
                      <div className="flex h-[85%] w-full items-end justify-center">
                        <div
                          title={`${item.month}: ${currency(item.revenue)}`}
                          className="w-full max-w-12 rounded-t-md bg-[#a88a5a] transition-all duration-300 hover:bg-[#755a32]"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="mt-3 w-full truncate text-center text-[10px] text-[#817b70] sm:text-xs">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-[#9a9388]">
                Hover over a bar to see its monthly revenue.
              </p>
            </div>
          ) : (
            <EmptyMessage message="No monthly revenue data is available yet." />
          )}
        </section>

        {/* Order activity and recent orders */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8055]">
              Order activity
            </p>
            <h2 className="mt-2 font-serif text-xl font-semibold">
              Recent Order Statuses
            </h2>
            <p className="mt-1 text-xs text-[#817b70]">
              Breakdown of the latest orders returned by the dashboard API.
            </p>

            {orderStatuses.length > 0 ? (
              <div className="mt-6 space-y-4">
                {orderStatuses.map(({ status, count }) => {
                  const colors = {
                    pending: "bg-amber-500",
                    processing: "bg-blue-500",
                    shipped: "bg-indigo-500",
                    delivered: "bg-emerald-600",
                    cancelled: "bg-rose-500",
                  };

                  return (
                    <div key={status}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="capitalize text-[#514b42]">
                          {status}
                        </span>
                        <span className="font-semibold text-[#302a22]">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#f0ece5]">
                        <div
                          className={`h-full rounded-full ${
                            colors[status] || "bg-[#a88a5a]"
                          }`}
                          style={{
                            width: `${(count / orders.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="pt-2 text-xs text-[#9a9388]">
                  Based on {orders.length} latest orders.
                </p>
              </div>
            ) : (
              <EmptyMessage message="No recent order data is available." />
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e8e2d7] bg-white shadow-sm xl:col-span-2">
            <div className="flex flex-col justify-between gap-3 border-b border-[#eee9e0] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8055]">
                  Store activity
                </p>
                <h2 className="mt-2 font-serif text-xl font-semibold">
                  Recent Orders
                </h2>
              </div>
              <button
                onClick={() => router.push("/admin/orders")}
                className="w-fit rounded-lg border border-[#ded8cc] px-4 py-2 text-xs font-semibold text-[#665333] transition hover:bg-[#f8f5ee]"
              >
                View All Orders →
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.14em] text-[#8b857a]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Order</th>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ece5]">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#fcfbf8]">
                        <td className="px-5 py-4 text-sm font-semibold">
                          #{order.id}
                        </td>
                        <td className="px-5 py-4">
                          <p className="max-w-40 truncate text-sm font-medium">
                            {order.customer_name || "Customer"}
                          </p>
                          <p className="mt-1 max-w-40 truncate text-xs text-[#8b857a]">
                            {order.email || ""}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold">
                          {currency(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-[#f3f0e9] px-3 py-1 text-xs font-medium capitalize text-[#76613e]">
                            {order.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyMessage message="No recent orders to display." />
            )}
          </div>
        </section>

        {/* Report note */}
        <div className="rounded-xl border border-[#e8e2d7] bg-[#f1eee7] p-4 text-xs leading-5 text-[#817b70]">
          Analytics are based on the existing admin statistics API. The
          revenue chart uses its monthly revenue data, and the order status
          breakdown uses the latest orders returned by that API.
        </div>
      </div>
    </main>
  );
}

function MetricCard({ title, value, description, icon }) {
  return (
    <div className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[#817b70]">{title}</p>
          <p className="mt-3 break-words font-serif text-2xl font-semibold tracking-tight text-[#302a22] sm:text-3xl">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f0e8] font-serif text-xl text-[#92774c]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-[#9a9388]">{description}</p>
    </div>
  );
}

function EmptyMessage({ message }) {
  return (
    <div className="flex min-h-40 items-center justify-center p-6 text-center text-sm text-[#8b857a]">
      {message}
    </div>
  );
}