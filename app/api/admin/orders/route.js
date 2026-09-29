
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("primenest-session")?.value;

  if (!token) return false;

  const user = await verifySessionToken(token);
  return user?.role === "admin";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await pool.query(`
      SELECT
        id,
        customer_name,
        email,
        total,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC, id DESC
    `);

    return Response.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("Admin orders API error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}