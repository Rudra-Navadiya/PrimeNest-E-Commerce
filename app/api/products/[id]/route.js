import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        c.name AS category,
        c.slug AS category_slug,
        pi.image_url AS image
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      LEFT JOIN product_images pi
        ON p.id = pi.product_id
        AND pi.is_primary = TRUE
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Product API error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}