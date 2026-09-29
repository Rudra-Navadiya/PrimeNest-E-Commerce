

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/admin", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "□" },
  { label: "Orders", href: "/admin/orders", icon: "▤" },
  { label: "Customers", href: "/admin/customers", icon: "♙" },
  { label: "Analytics", href: "/admin/analytics", icon: "▥" },
  // { label: "Statistics", href: "/admin/stats", icon: "◷" },
  // { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Keep the admin login page free of the sidebar.
  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">P</div>
          <div>
            <div className="admin-brand-name">PrimeNest</div>
            <div className="admin-brand-caption">ADMIN PANEL</div>
          </div>
        </div>

        <div className="admin-nav-heading">MAIN MENU</div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-footer-label">STORE MANAGEMENT</div>
          <div className="admin-footer-name">PrimeNest Store</div>
        </div>
      </aside>

      <div className="admin-content">{children}</div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f2e9;
          color: #29251f;
        }

        .admin-sidebar {
          width: 245px;
          min-width: 245px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 25px 16px 18px;
          background: #29251f;
          color: #f9f6ef;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 4px 9px 30px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }

        .admin-brand-mark {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #b89a65;
          color: #29251f;
          font: bold 24px Georgia, serif;
        }

        .admin-brand-name {
          font: bold 20px Georgia, serif;
          letter-spacing: 0.2px;
        }

        .admin-brand-caption {
          margin-top: 4px;
          color: #b9ad99;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.7px;
        }

        .admin-nav-heading {
          padding: 27px 11px 11px;
          color: #a99e8c;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 43px;
          padding: 0 12px;
          border: 1px solid transparent;
          border-radius: 7px;
          color: #d5cec2;
          text-decoration: none;
          font-size: 13px;
          transition: background 0.18s, color 0.18s;
        }

        .admin-nav-link:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        .admin-nav-link.active {
          background: #b89a65;
          color: #29251f;
          font-weight: 700;
        }

        .admin-nav-icon {
          width: 19px;
          text-align: center;
          font-size: 17px;
        }

        .admin-sidebar-footer {
          margin-top: auto;
          padding: 17px 11px 5px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }

        .admin-footer-label {
          color: #a99e8c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
        }

        .admin-footer-name {
          margin-top: 7px;
          color: #f9f6ef;
          font-size: 12px;
        }

        .admin-content {
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 760px) {
          .admin-layout {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            min-width: 0;
            min-height: auto;
            padding: 12px;
          }

          .admin-brand {
            padding: 3px 5px 12px;
          }

          .admin-nav-heading,
          .admin-sidebar-footer {
            display: none;
          }

          .admin-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 5px;
            padding-top: 10px;
          }

          .admin-nav-link {
            min-height: 35px;
            padding: 0 9px;
            font-size: 11px;
          }

          .admin-nav-icon {
            width: auto;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
