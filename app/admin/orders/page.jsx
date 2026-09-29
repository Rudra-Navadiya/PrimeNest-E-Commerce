
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const statuses = [
  "pending",
  "delivered",
];

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (order, newStatus) => {
    const previousStatus = String(order.status || "pending").toLowerCase();

    if (newStatus === previousStatus) return;

    setUpdatingId(order.id);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update order.");
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, status: data.order.status }
            : item
        )
      );

      setSelectedOrder((current) =>
        current?.id === order.id
          ? { ...current, status: data.order.status }
          : current
      );

      toast.success(`Order #${order.id} status updated.`);
    } catch (error) {
      toast.error(error.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const term = search.trim().toLowerCase();
    const status = String(order.status || "pending").toLowerCase();

    const matchesSearch =
      !term ||
      String(order.id).toLowerCase().includes(term) ||
      String(order.customer_name || "").toLowerCase().includes(term) ||
      String(order.email || "").toLowerCase().includes(term);

    const matchesStatus = filter === "all" || status === filter;

    return matchesSearch && matchesStatus;
  });

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const pendingCount = orders.filter(
    (order) => String(order.status || "pending").toLowerCase() === "pending"
  ).length;

  const completedCount = orders.filter(
    (order) => String(order.status || "").toLowerCase() === "delivered"
  ).length;

  return (
    <main className="pn-orders-page">
      <style jsx>{`
        .pn-orders-page {
          min-height: 100vh;
          padding: 36px 28px 60px;
          background: #f5f2e9;
          color: #29251f;
        }

        .pn-orders-container {
          max-width: 1450px;
          margin: 0 auto;
        }

        .pn-orders-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 26px;
        }

        .pn-eyebrow {
          color: #918779;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .pn-title {
          margin: 7px 0 4px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
          line-height: 1.2;
        }

        .pn-subtitle {
          margin: 0;
          color: #898276;
          font-size: 13px;
        }

        .pn-button {
          border: 1px solid #d9d2c6;
          border-radius: 6px;
          padding: 11px 16px;
          background: #fbf9f3;
          color: #393329;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .pn-button:hover {
          background: #eee8dc;
        }

        .pn-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .pn-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .pn-stat {
          padding: 20px;
          border: 1px solid #e7e1d5;
          border-radius: 10px;
          background: #fbf9f3;
          box-shadow: 0 2px 8px rgba(42, 35, 25, 0.025);
        }

        .pn-stat-label {
          color: #827b70;
          font-size: 12px;
        }

        .pn-stat-value {
          margin-top: 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .pn-card {
          overflow: hidden;
          border: 1px solid #e7e1d5;
          border-radius: 10px;
          background: #fbf9f3;
          box-shadow: 0 2px 8px rgba(42, 35, 25, 0.025);
        }

        .pn-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          padding: 19px 20px;
          border-bottom: 1px solid #eae5da;
        }

        .pn-section-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
        }

        .pn-tools {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .pn-search,
        .pn-filter {
          min-height: 39px;
          border: 1px solid #ded8cc;
          border-radius: 7px;
          background: #fffdf8;
          padding: 9px 12px;
          color: #29251f;
          font-size: 12px;
          outline: none;
        }

        .pn-search {
          width: 260px;
        }

        .pn-search:focus,
        .pn-filter:focus,
        .pn-status-select:focus {
          border-color: #9d8358;
          box-shadow: 0 0 0 3px rgba(157, 131, 88, 0.1);
        }

        .pn-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .pn-table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
          text-align: left;
        }

        .pn-table th {
          padding: 14px 16px;
          background: #f5f1e8;
          color: #81796d;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .pn-table td {
          padding: 14px 16px;
          border-top: 1px solid #eee9df;
          font-size: 12px;
          vertical-align: middle;
        }

        .pn-table tbody tr:hover {
          background: #f8f5ed;
        }

        .pn-customer {
          font-weight: 700;
          color: #302b24;
        }

        .pn-email {
          display: block;
          margin-top: 4px;
          color: #898276;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .pn-status-select {
          min-width: 130px;
          border: 1px solid #ded8cc;
          border-radius: 6px;
          background: #fffdf8;
          padding: 8px 9px;
          color: #393329;
          font-size: 11px;
          text-transform: capitalize;
          outline: none;
        }

        .pn-status-select:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .pn-view-button {
          border: 1px solid #ded7ca;
          border-radius: 5px;
          background: #fffdf8;
          color: #443b2e;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .pn-view-button:hover {
          background: #eee8dc;
        }

        .pn-empty {
          padding: 48px 20px;
          color: #827b70;
          text-align: center;
          font-size: 13px;
        }

        .pn-footer {
          padding: 12px 20px;
          border-top: 1px solid #eae5da;
          color: #898276;
          font-size: 11px;
        }

        .pn-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(28, 25, 20, 0.55);
        }

        .pn-modal {
          width: 100%;
          max-width: 510px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #e7e1d5;
          border-radius: 12px;
          background: #fbf9f3;
          padding: 25px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .pn-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .pn-modal-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
        }

        .pn-detail-list {
          display: grid;
          gap: 0;
        }

        .pn-detail-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #eae5da;
          font-size: 12px;
        }

        .pn-detail-label {
          color: #827b70;
        }

        .pn-detail-value {
          max-width: 65%;
          color: #302b24;
          font-weight: 700;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .pn-modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        @media (max-width: 900px) {
          .pn-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .pn-orders-page {
            padding: 24px 14px 40px;
          }

          .pn-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .pn-toolbar {
            align-items: stretch;
          }

          .pn-tools {
            flex-direction: column;
          }

          .pn-search,
          .pn-filter {
            width: 100%;
          }

          .pn-title {
            font-size: 29px;
          }

          .pn-modal {
            padding: 18px;
          }
        }
      `}</style>

      <div className="pn-orders-container">
        <header className="pn-orders-header">
          <div>
            <div className="pn-eyebrow">STORE MANAGEMENT</div>
            <h1 className="pn-title">Orders</h1>
            <p className="pn-subtitle">
              View and manage your PrimeNest customer orders.
            </p>
          </div>
        </header>

        <section className="pn-stats">
          <div className="pn-stat">
            <div className="pn-stat-label">Total Orders</div>
            <div className="pn-stat-value">{orders.length}</div>
          </div>

          <div className="pn-stat">
            <div className="pn-stat-label">Total Order Value</div>
            <div className="pn-stat-value">{currency(totalValue)}</div>
          </div>

          <div className="pn-stat">
            <div className="pn-stat-label">Pending Orders</div>
            <div className="pn-stat-value">{pendingCount}</div>
          </div>

          <div className="pn-stat">
            <div className="pn-stat-label">Delivered</div>
            <div className="pn-stat-value">{completedCount}</div>
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-toolbar">
            <h2 className="pn-section-title">All Orders</h2>

            <div className="pn-tools">
              <input
                className="pn-search"
                type="search"
                placeholder="Search order, customer, email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search orders"
              />

              <select
                className="pn-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter orders by status"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="pn-empty">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="pn-empty">
              {search || filter !== "all"
                ? "No orders match your search or filter."
                : "No orders have been placed yet."}
            </div>
          ) : (
            <div className="pn-table-scroll">
              <table className="pn-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>

                      <td>
                        <span className="pn-customer">
                          {order.customer_name || "Customer"}
                        </span>
                        <span className="pn-email">
                          {order.email || "No email"}
                        </span>
                      </td>

                      <td>{formatDate(order.created_at)}</td>

                      <td><strong>{currency(order.total)}</strong></td>

                      <td>
                        <select
                          className="pn-status-select"
                          value={String(order.status || "pending").toLowerCase()}
                          disabled={updatingId === order.id}
                          onChange={(event) =>
                            updateStatus(order, event.target.value)
                          }
                          aria-label={`Change status for order ${order.id}`}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        {updatingId === order.id && (
                          <small style={{ display: "block", marginTop: 4 }}>
                            Saving...
                          </small>
                        )}
                      </td>

                      <td>
                        <button
                          className="pn-view-button"
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pn-footer">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </section>
      </div>

      {selectedOrder && (
        <div
          className="pn-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            className="pn-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pn-order-title"
          >
            <div className="pn-modal-header">
              <h2 className="pn-modal-title" id="pn-order-title">
                Order #{selectedOrder.id}
              </h2>
              <button
                className="pn-button"
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ✕
              </button>
            </div>

            <div className="pn-detail-list">
              <div className="pn-detail-row">
                <span className="pn-detail-label">Customer</span>
                <span className="pn-detail-value">
                  {selectedOrder.customer_name || "—"}
                </span>
              </div>

              <div className="pn-detail-row">
                <span className="pn-detail-label">Email</span>
                <span className="pn-detail-value">
                  {selectedOrder.email || "—"}
                </span>
              </div>

              <div className="pn-detail-row">
                <span className="pn-detail-label">Order date</span>
                <span className="pn-detail-value">
                  {formatDate(selectedOrder.created_at)}
                </span>
              </div>

              <div className="pn-detail-row">
                <span className="pn-detail-label">Total</span>
                <span className="pn-detail-value">
                  {currency(selectedOrder.total)}
                </span>
              </div>

              <div className="pn-detail-row">
                <span className="pn-detail-label">Status</span>
                <span className="pn-detail-value">
                  {String(selectedOrder.status || "pending")
                    .charAt(0)
                    .toUpperCase() +
                    String(selectedOrder.status || "pending").slice(1)}
                </span>
              </div>
            </div>

            <div className="pn-modal-actions">
              <button
                className="pn-button"
                type="button"
                onClick={() => setSelectedOrder(null)}
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