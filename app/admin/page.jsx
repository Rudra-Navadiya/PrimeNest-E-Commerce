
"use client";
import AdminLogoutButton from "@/app/components/AdminLogoutButton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function AdminPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/stats", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load dashboard."
          );
        }

        if (active) {
          // Support both { stats: {...} } and flat statistics API responses.
          setDashboard(
            data.stats
              ? data
              : {
                  ...data,
                  stats: data,
                }
          );
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  const stats = dashboard
    ? [
        {
          label: "Total Sales",
          value: currency(dashboard.stats?.totalSales ?? 0),
          note: "Revenue from all orders",
          icon: "₹",
        },
        {
          label: "Registered Users",
          value: (dashboard.stats?.userCount ?? 0).toLocaleString("en-IN"),
          note: "Customer accounts",
          icon: "♙",
        },
        {
          label: "Total Products",
          value: (dashboard.stats?.productCount ?? 0).toLocaleString("en-IN"),
          note: "Products in your store",
          icon: "▣",
        },
        {
          label: "Total Orders",
          value: (dashboard.stats?.orderCount ?? 0).toLocaleString("en-IN"),  
          note: "Orders received",
          icon: "▤",
        },
      ]
    : [];

  const revenueByMonth = monthNames.map((month, index) => {
    const monthlyRevenue =
      dashboard?.stats?.monthlyRevenue ?? dashboard?.monthlyRevenue ?? [];

    const match = monthlyRevenue.find(
      (item) =>
        Number(item.month_number) === index + 1 ||
        item.month === month
    );

    return {
      month,
      revenue: Number(match?.revenue || 0),
    };
  });

  const maxRevenue = Math.max(
    ...revenueByMonth.map((item) => item.revenue),
    1
  );

  return (
    <main className="admin-page">

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="topbar-eyebrow">
              PRIMENEST / ADMINISTRATION
            </span>
            <h1 style={{ fontWeight: 900 }}>Overview</h1>
          </div>

          <div className="admin-top-actions">
            <span className="admin-date">Store dashboard</span>
            <button
              className="admin-notification"
              aria-label="Notifications"
              type="button"
            >
              ♧
            </button>
            <div className="profile-avatar top-avatar">A</div>
          </div>
        </header>

        <div className="admin-welcome">
          <div>
            <p className="welcome-kicker">
              YOUR STORE AT A GLANCE
            </p>
            <h2>Welcome back, Admin</h2>
            <p>
              Here is what is happening with your store today.
            </p>
          </div>

         
        </div>

        {loading && (
          <div className="admin-panel" role="status">
            Loading your store data...
          </div>
        )}

        {error && (
          <div className="admin-panel" role="alert">
            <strong>Dashboard error</strong>
            <p>{error}</p>
            <button
              className="admin-primary-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && dashboard && (
          <>
            <section className="admin-stats">
              {stats.map((stat) => (
                <article
                  className="admin-stat-card"
                  key={stat.label}
                >
                  <div className="stat-card-top">
                    <span>{stat.label}</span>
                    <span className="stat-icon">{stat.icon}</span>
                  </div>
                  <strong>{stat.value}</strong>
                  <small>{stat.note}</small>
                </article>
              ))}
            </section>

            <section className="admin-dashboard-grid">
              <article className="admin-panel revenue-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Monthly Revenue</h3>
                    <p>Current calendar year</p>
                  </div>
                  <span className="panel-filter">This year</span>
                </div>

                <div className="revenue-total">
                  {currency(dashboard.stats?.totalSales ?? 0)}
                </div>

                <div
                  className="revenue-chart"
                  aria-label="Monthly revenue chart"
                >
                  {revenueByMonth.map((item) => (
                    <div
                      className="chart-column"
                      key={item.month}
                      title={`${item.month}: ${currency(item.revenue)}`}
                    >
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.max(
                            item.revenue > 0
                              ? (item.revenue / maxRevenue) * 100
                              : 0,
                            item.revenue > 0 ? 4 : 0
                          )}%`,
                        }}
                      />
                      <small>{item.month}</small>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel region-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Store Summary</h3>
                    <p>Live database totals</p>
                  </div>
                </div>

                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">₹</span>
                    <div>
                      <strong>Total sales</strong>
                      <small>
                        {currency(dashboard.stats?.totalSales ?? 0)}
                      </small>
                    </div>
                  </div>

                  <div className="activity-item">
                    <span className="activity-icon">▣</span>
                    <div>
                      <strong>Products</strong>
                      <small>
                        {dashboard.stats?.productCount ?? 0}
                      </small>
                    </div>
                  </div>

                  <div className="activity-item">
                    <span className="activity-icon">♙</span>
                    <div>
                      <strong>Customers</strong>
                      <small>
                        {dashboard.stats?.userCount ?? 0}
                      </small>
                    </div>
                  </div>

                  <div className="activity-item">
                    <span className="activity-icon">▤</span>
                    <div>
                      <strong>Orders</strong>
                      <small>
                        {dashboard.stats?.orderCount ?? 0}
                      </small>
                    </div>
                  </div>
                </div>
              </article>
            </section>

            <section className="admin-bottom-grid">
              <article className="admin-panel orders-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent Orders</h3>
                    <p>Latest orders from your database</p>
                  </div>
                  <a className="view-all" href="/admin/orders">
                    View all →
                  </a>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(dashboard.stats?.latestOrders ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={4}>
                            No orders have been placed yet.
                          </td>
                        </tr>
                      ) : (
                        (dashboard.stats?.latestOrders ?? []).map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.customer_name}</td>
                            <td>{order.email}</td>
                            <td>
                              ₹{Number(order.total || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>  
                  </table>
                </div>
              </article>

              <article className="admin-panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent Activity</h3>
                    <p>Latest order activity</p>
                  </div>
                </div>

                <div className="activity-list">
                  {(dashboard.stats?.latestOrders ?? []).length === 0 ? (
                    <p>No recent activity yet.</p>
                  ) : (
                    (dashboard.stats?.latestOrders ?? []).slice(0, 5).map((order) => (
                      <div
                        className="activity-item"
                        key={order.id}
                      >
                        <span className="activity-icon">▣</span>
                        <div>
                          <strong>
                            Order #{order.id} received
                          </strong>
                          <small>
                            {order.customer_name} · {order.status}
                          </small>
                        </div>
                        <span className="activity-dot" />
                      </div>
                    ))
                  )}
                </div>
              </article>
            </section>
          </>
        )}

        <footer className="admin-footer">
          <span>© 2026 PrimeNest</span>
          <span>Classic Admin Dashboard</span>
        </footer>
      </section>
    </main>
  );
}