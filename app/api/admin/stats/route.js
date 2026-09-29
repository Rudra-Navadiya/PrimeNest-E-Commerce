
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Verify admin login
    const cookieStore = await cookies();
    const token = cookieStore.get("primenest-session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // 2. Get total sales and order count
    const salesResult = await pool.query(`
      SELECT
        COALESCE(SUM(total), 0) AS "totalSales",
        COUNT(*)::int AS "orderCount"
      FROM orders
    `);

    // 3. Get registered customer count
    const customersResult = await pool.query(`
      SELECT COUNT(*)::int AS "userCount"
      FROM users
      WHERE role = 'user'
    `);

    // 4. Get product count
    const productsResult = await pool.query(`
      SELECT COUNT(*)::int AS "productCount"
      FROM products
    `);

    // 5. Get monthly revenue for the current year
    const monthlyResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
        EXTRACT(MONTH FROM created_at)::int AS month_number,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
        AND created_at < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'
      GROUP BY DATE_TRUNC('month', created_at),
               EXTRACT(MONTH FROM created_at)
      ORDER BY month_number
    `);

    // 6. Get the latest five orders
    const latestOrdersResult = await pool.query(`
      SELECT
        id,
        customer_name,
        email,
        total,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 7. Return consistent field names for the Analytics page
  
return NextResponse.json({
  success: true,

  // Keep these fields for the Analytics page
  totalSales: Number(salesResult.rows[0].totalSales),
  orderCount: Number(salesResult.rows[0].orderCount),
  userCount: Number(customersResult.rows[0].userCount),
  productCount: Number(productsResult.rows[0].productCount),
  latestOrders: latestOrdersResult.rows,
  monthlyRevenue: monthlyResult.rows.map((row) => ({
    month: row.month,
    revenue: Number(row.revenue),
  })),

  // Add this nested object for the Admin Dashboard
  stats: {
    totalSales: Number(salesResult.rows[0].totalSales),
    orderCount: Number(salesResult.rows[0].orderCount),
    userCount: Number(customersResult.rows[0].userCount),
    productCount: Number(productsResult.rows[0].productCount),
    latestOrders: latestOrdersResult.rows,
    monthlyRevenue: monthlyResult.rows.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue),
    })),
  },
});
  } catch (error) {
    console.error("Admin stats API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}