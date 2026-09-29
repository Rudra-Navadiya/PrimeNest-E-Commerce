"use client";

import Link from "next/link"; 
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image: "",
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (error) {
      toast.error(error.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

 function startCreating() {
  setSelectedProduct({ id: null });

  setForm({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image: "",
  });
}

  const openEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      category_id: String(product.category_id ?? ""),
      image: product.image || "",
    });
  };

  const closeEdit = () => {
    if (saving) return;
    setSelectedProduct(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  
const saveProduct = async (event) => {
  event.preventDefault();

  if (!selectedProduct) return;

  const isNewProduct = selectedProduct.id === null;

  if (!form.name.trim()) {
    toast.error("Product name is required.");
    return;
  }

  if (!isNewProduct && !form.slug.trim()) {
    toast.error("Product slug is required.");
    return;
  }

  if (
    !Number.isFinite(Number(form.price)) ||
    Number(form.price) <= 0
  ) {
    toast.error("Enter a valid product price.");
    return;
  }

  if (
    form.stock === "" ||
    !Number.isInteger(Number(form.stock)) ||
    Number(form.stock) < 0
  ) {
    toast.error("Enter a valid stock quantity.");
    return;
  }

  if (!form.category_id) {
    toast.error("Please select a category.");
    return;
  }

  setSaving(true);

  try {
    const response = await fetch(
      isNewProduct
        ? "/api/admin/products"
        : `/api/admin/products/${selectedProduct.id}`,
      {
        method: isNewProduct ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          ...(isNewProduct ? {} : { slug: form.slug.trim() }),
          description: form.description.trim(),
          price: Number(form.price),
          stock: Number(form.stock),
          category_id: Number(form.category_id),
          image_url: form.image.trim(),
        }),
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      router.replace("/admin/login");
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          (isNewProduct
            ? "Could not add product."
            : "Could not update product.")
      );
    }

    toast.success(
      isNewProduct
        ? "Product added successfully."
        : "Product updated successfully."
    );

    setSelectedProduct(null);
    await loadProducts();
  } catch (error) {
    toast.error(
      error.message || "Failed to save product."
    );
  } finally {
    setSaving(false);
  }
};

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete product.");
      }

      toast.success("Product deleted successfully.");
      await loadProducts();
    } catch (error) {
      toast.error(error.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();

    return (
      !term ||
      String(product.name || "").toLowerCase().includes(term) ||
      String(product.slug || "").toLowerCase().includes(term) ||
      String(product.category || "").toLowerCase().includes(term) ||
      String(product.id || "").toLowerCase().includes(term)
    );
  });

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  return (
    <main className="pn-products-page">
      <style jsx>{`
        .pn-products-page {
          min-height: 100vh;
          padding: 36px 28px 60px;
          background: #f5f2e9;
          color: #29251f;
        }

        .pn-products-container {
          max-width: 1450px;
          margin: 0 auto;
        }

        .pn-products-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
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

        .pn-primary {
          border-color: #30291f;
          background: #30291f;
          color: #fffaf0;
        }

        .pn-primary:hover {
          background: #51432f;
        }

        .pn-product-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
          justify-content: space-between;
          align-items: center;
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

        .pn-search {
          width: 260px;
          min-height: 39px;
          border: 1px solid #ded8cc;
          border-radius: 7px;
          background: #fffdf8;
          padding: 9px 12px;
          color: #29251f;
          font-size: 12px;
          outline: none;
        }

        .pn-search:focus,
        .pn-input:focus,
        .pn-textarea:focus,
        .pn-select:focus {
          border-color: #9d8358;
          box-shadow: 0 0 0 3px rgba(157, 131, 88, 0.1);
        }

        .pn-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .pn-table {
          width: 100%;
          min-width: 850px;
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

        .pn-product-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 220px;
        }

        .pn-product-image {
          width: 53px;
          height: 57px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #e8e1d5;
          border-radius: 6px;
          background: #f1ede4;
          color: #9b8d77;
          font-size: 10px;
        }

        .pn-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pn-product-name {
          color: #302b24;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .pn-product-slug {
          margin-top: 4px;
          color: #898276;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .pn-stock-low {
          color: #a33d34;
          font-weight: 700;
        }

        .pn-stock-ok {
          color: #386b3c;
          font-weight: 700;
        }

        .pn-actions {
          display: flex;
          gap: 7px;
        }

        .pn-action-button {
          border: 1px solid #ded7ca;
          border-radius: 5px;
          background: #fffdf8;
          color: #443b2e;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .pn-action-button:hover {
          background: #eee8dc;
        }

        .pn-delete-button {
          border-color: #e9c9c3;
          color: #a33d34;
        }

        .pn-delete-button:hover {
          background: #f8e7e4;
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
          max-width: 620px;
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
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .pn-modal-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
        }

        .pn-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .pn-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .pn-field-full {
          grid-column: 1 / -1;
        }

        .pn-label {
          color: #655d50;
          font-size: 11px;
          font-weight: 700;
        }

        .pn-input,
        .pn-select,
        .pn-textarea {
          width: 100%;
          min-height: 40px;
          border: 1px solid #ded8cc;
          border-radius: 6px;
          background: #fffdf8;
          padding: 10px 11px;
          color: #29251f;
          font: inherit;
          font-size: 12px;
          outline: none;
        }

        .pn-textarea {
          min-height: 90px;
          resize: vertical;
        }

        .pn-modal-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }

        @media (max-width: 750px) {
          .pn-products-page {
            padding: 24px 14px 40px;
          }

          .pn-product-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .pn-toolbar {
            align-items: stretch;
          }

          .pn-search {
            width: 100%;
          }
        }

        @media (max-width: 500px) {
          .pn-title {
            font-size: 29px;
          }

          .pn-form-grid {
            grid-template-columns: 1fr;
          }

          .pn-field-full {
            grid-column: auto;
          }

          .pn-modal {
            padding: 18px;
          }
        }
      `}</style>

      <div className="pn-products-container">
        <header className="pn-products-header">
          <div>
            <div className="pn-eyebrow">STORE MANAGEMENT</div>
            <h1 className="pn-title">Products</h1>
            <p className="pn-subtitle">
              Manage your PrimeNest store inventory and products.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {/* <button
              className="pn-button"
              type="button"
              onClick={loadProducts}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button> */}

            <button
              type="button"
              className="group inline-flex w-fit items-center gap-2.5 rounded-xl bg-[#29251f] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#29251f]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#42382b] hover:shadow-lg hover:shadow-[#29251f]/25 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[#b89a65]/30"
              onClick={startCreating}
            >
              + Add Product
            </button>
          </div>
        </header>

        <section className="pn-product-stats">
          <div className="pn-stat">
            <div className="pn-stat-label">Total Products</div>
            <div className="pn-stat-value">{products.length}</div>
          </div>

          <div className="pn-stat">
            <div className="pn-stat-label">Total Stock Units</div>
            <div className="pn-stat-value">{totalStock.toLocaleString("en-IN")}</div>
          </div>

          <div className="pn-stat">
            <div className="pn-stat-label">Low Stock Products</div>
            <div className="pn-stat-value">
              {products.filter((product) => Number(product.stock || 0) <= 5).length}
            </div>
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-toolbar">
            <h2 className="pn-section-title">All Products</h2>

            <input
              className="pn-search"
              type="search"
              placeholder="Search product, category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
          </div>

          {loading ? (
            <div className="pn-empty">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="pn-empty">
              {search
                ? "No products match your search."
                : "No products found. Add your first product."}
            </div>
          ) : (
            <div className="pn-table-scroll">
              <table className="pn-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="pn-product-info">
                          <div className="pn-product-image">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name || "Product"}
                              />
                            ) : (
                              "No image"
                            )}
                          </div>
                          <div>
                            <div className="pn-product-name">
                              {product.name}
                            </div>
                            <div className="pn-product-slug">
                              {product.slug || `Product #${product.id}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{product.category || "Uncategorized"}</td>
                      <td><strong>{money(product.price)}</strong></td>
                      <td>
                        <span className={
                          Number(product.stock || 0) <= 5
                            ? "pn-stock-low"
                            : "pn-stock-ok"
                        }>
                          {Number(product.stock || 0)}
                        </span>
                      </td>
                      <td>
                        <div className="pn-actions">
                          <button
                            className="pn-action-button"
                            type="button"
                            onClick={() => openEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="pn-action-button pn-delete-button"
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() => deleteProduct(product)}
                          >
                            {deletingId === product.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pn-footer">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </section>
      </div>

      {selectedProduct && (
        <div
          className="pn-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit();
          }}
        >
          <section
            className="pn-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pn-edit-title"
          >
            <div className="pn-modal-header">
              <h2 className="pn-modal-title" id="pn-edit-title">
                Edit Product
              </h2>
              <button
                className="pn-button"
                type="button"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close edit form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="pn-form-grid">
                <div className="pn-field pn-field-full">
                  <label className="pn-label" htmlFor="pn-name">
                    Product Name
                  </label>
                  <input
                    id="pn-name"
                    className="pn-input"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="pn-field pn-field-full">
                  <label className="pn-label" htmlFor="pn-slug">
                    Product Slug
                  </label>
                  <input
                    id="pn-slug"
                    className="pn-input"
                    name="slug"
                    value={form.slug}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="pn-field pn-field-full">
                  <label className="pn-label" htmlFor="pn-description">
                    Description
                  </label>
                  <textarea
                    id="pn-description"
                    className="pn-textarea"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="pn-field">
                  <label className="pn-label" htmlFor="pn-price">
                    Price (₹)
                  </label>
                  <input
                    id="pn-price"
                    className="pn-input"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="pn-field">
                  <label className="pn-label" htmlFor="pn-stock">
                    Stock Quantity
                  </label>
                  <input
                    id="pn-stock"
                    className="pn-input"
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="pn-field pn-field-full">
                  <label className="pn-label" htmlFor="pn-category">
                    Category
                  </label>
                  <select
                    id="pn-category"
                    className="pn-select"
                    name="category_id"
                    value={form.category_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pn-field pn-field-full">
                  <label className="pn-label" htmlFor="pn-image">
                    Primary Image URL
                  </label>
                  <input
                    id="pn-image"
                    className="pn-input"
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleFormChange}
                    placeholder="https://example.com/product.jpg"
                  />
                </div>
              </div>

              <div className="pn-modal-actions">
                <button
                  className="pn-button"
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="pn-button pn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}