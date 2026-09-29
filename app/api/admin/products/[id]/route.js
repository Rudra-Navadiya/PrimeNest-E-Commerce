
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

function createSlug(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "product"
  );
}

// PUT: Update an existing product
export async function PUT(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  let client;

  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const categoryId = Number(body.category_id);

    // Accept either image or image_url from the frontend.
    // Missing or blank image means keep the existing image.
    const imageUrl = String(
      body.image_url ?? body.image ?? ""
    ).trim();

    if (!name) {
      return Response.json(
        { success: false, message: "Product name is required" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Enter a valid price, stock, and category",
        },
        { status: 400 }
      );
    }

    if (
      imageUrl &&
      (!/^https?:\/\//i.test(imageUrl) || imageUrl.length > 5000)
    ) {
      return Response.json(
        { success: false, message: "Enter a valid image URL" },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Check that the product exists and lock it during the update.
    const currentResult = await client.query(
      "SELECT id FROM products WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (currentResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check that the selected category exists.
    const categoryResult = await client.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        { success: false, message: "Selected category was not found" },
        { status: 400 }
      );
    }

    // Generate a unique slug.
    const baseSlug = createSlug(name);
    let slug = baseSlug;
    let suffix = 1;

    while (true) {
      const existing = await client.query(
        "SELECT id FROM products WHERE slug = $1 AND id <> $2",
        [slug, id]
      );

      if (existing.rowCount === 0) break;

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    // Update product details without changing its image.
    const updatedResult = await client.query(
      `UPDATE products
       SET name = $1,
           slug = $2,
           description = $3,
           price = $4,
           stock = $5,
           category_id = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, name, slug, description, price, stock, category_id`,
      [name, slug, description, price, stock, categoryId, id]
    );

    // Only replace the primary image if a new URL was provided.
    // Empty or missing image fields preserve the existing image.
    if (imageUrl) {
      await client.query(
        `DELETE FROM product_images
         WHERE product_id = $1 AND is_primary = TRUE`,
        [id]
      );

      await client.query(
        `INSERT INTO product_images
          (product_id, image_url, is_primary)
         VALUES ($1, $2, TRUE)`,
        [id, imageUrl]
      );
    }

    await client.query("COMMIT");

    return Response.json({
      success: true,
      message: "Product updated successfully",
      product: updatedResult.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Admin product PUT error:", error);

    return Response.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}

// DELETE: Remove a product
export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id FROM products WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (productResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Remove associated images before deleting the product.
    await client.query(
      "DELETE FROM product_images WHERE product_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM products WHERE id = $1",
      [id]
    );

    await client.query("COMMIT");

    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Admin product DELETE error:", error);

    if (error.code === "23503") {
      return Response.json(
        {
          success: false,
          message:
            "This product is linked to an order and cannot be deleted. Keep it in your records instead.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}