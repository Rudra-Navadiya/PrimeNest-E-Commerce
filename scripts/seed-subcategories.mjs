import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const client = new pg.Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "primenest_db",
});

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await client.connect();
  console.log("Connected to database primenest_db");

  // 1. Create subcategories table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_subcategories_category_name UNIQUE (category_id, name)
    );
    CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
    CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
  `);
  console.log("✓ 'subcategories' table verified/created.");

  // 2. Ensure products table has subcategory_id column
  await client.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
  `);
  console.log("✓ 'products.subcategory_id' column verified/added.");

  // 3. Ensure Categories have exact IDs from pgAdmin (1: Men, 2: Women, 3: Accessories, 5: Footwear, 6: Perfume)
  const categoriesList = [
    { id: 1, name: "Men", slug: "men" },
    { id: 2, name: "Women", slug: "women" },
    { id: 3, name: "Accessories", slug: "accessories" },
    { id: 5, name: "Footwear", slug: "footwear" },
    { id: 6, name: "Perfume", slug: "perfume" },
  ];

  for (const cat of categoriesList) {
    await client.query(`
      INSERT INTO categories (id, name, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name, slug = EXCLUDED.slug
    `, [cat.id, cat.name, cat.slug]);
  }
  await client.query(`SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories))`);
  console.log("✓ Categories synced with exact IDs.");

  // 4. Subcategories data matching pgAdmin table rows
  const subcategoriesData = [
    // --- MEN (category_id: 1) ---
    { catId: 1, name: "T-Shirts" },
    { catId: 1, name: "Casual Shirts" },
    { catId: 1, name: "Formal Shirts" },
    { catId: 1, name: "Polo T-Shirts" },
    { catId: 1, name: "Sweatshirts" },
    { catId: 1, name: "Hoodies" },
    { catId: 1, name: "Jackets" },
    { catId: 1, name: "Sweaters" },
    { catId: 1, name: "Blazers" },
    { catId: 1, name: "Jeans" },
    { catId: 1, name: "Casual Trousers" },
    { catId: 1, name: "Formal Trousers" },
    { catId: 1, name: "Trousers" },
    { catId: 1, name: "Track Pants & Joggers" },
    { catId: 1, name: "Shorts" },
    { catId: 1, name: "Boxers" },
    { catId: 1, name: "T-SHIRT" },
    { catId: 1, name: "Track Pant & Joggers" },
    { catId: 1, name: "Flip Flops" },

    // --- WOMEN (category_id: 2) ---
    { catId: 2, name: "Dresses" },
    { catId: 2, name: "Tops" },
    { catId: 2, name: "T-Shirts" },
    { catId: 2, name: "Shirts" },
    { catId: 2, name: "Jeans" },
    { catId: 2, name: "Trousers" },
    { catId: 2, name: "Skirts" },
    { catId: 2, name: "Leggings" },
    { catId: 2, name: "Kurtis" },
    { catId: 2, name: "Sarees" },
    { catId: 2, name: "Jackets" },
    { catId: 2, name: "Hoodies" },
    { catId: 2, name: "Sweaters" },
    { catId: 2, name: "Blazers" },
    { catId: 2, name: "Co-ord Sets" },
    { catId: 2, name: "Lehenga Cholis" },
    { catId: 2, name: "Sweatshirts" },

    // --- ACCESSORIES (category_id: 3) ---
    { catId: 3, name: "Bags" },
    { catId: 3, name: "Backpacks" },
    { catId: 3, name: "Wallets" },
    { catId: 3, name: "Watches" },
    { catId: 3, name: "Sunglasses" },
    { catId: 3, name: "Belts" },
    { catId: 3, name: "Caps" },
    { catId: 3, name: "Hats" },
    { catId: 3, name: "Jewellery" },
    { catId: 3, name: "Scarves" },
    { catId: 3, name: "Ties" },
    { catId: 3, name: "Men's Sports Shoes" },
    { catId: 3, name: "Handbags" },
    { catId: 3, name: "Bracelets" },

    // --- FOOTWEAR (category_id: 5) ---
    { catId: 5, name: "Men's Sneakers" },
    { catId: 5, name: "Men's Casual Shoes" },
    { catId: 5, name: "Men's Formal Shoes" },
    { catId: 5, name: "Men's Sports Shoes" },
    { catId: 5, name: "Men's Sandals" },
    { catId: 5, name: "Men's Slippers" },
    { catId: 5, name: "Women's Sneakers" },
    { catId: 5, name: "Women's Casual Shoes" },
    { catId: 5, name: "Women's Formal Shoes" },
    { catId: 5, name: "Women's Sports Shoes" },
    { catId: 5, name: "Women's Heels" },
    { catId: 5, name: "Women's Sandals" },
    { catId: 5, name: "Women's Flats" },
    { catId: 5, name: "Women's Slippers" },
    { catId: 5, name: "Boots" },
    { catId: 5, name: "Flip Flops" },
    { catId: 5, name: "Sports Shoes" },
    { catId: 5, name: "Sneakers" },
    { catId: 5, name: "Casual Shoes" },

    // --- PERFUME (category_id: 6) ---
    { catId: 6, name: "Men's Perfume" },
    { catId: 6, name: "Women's Perfume" },
    { catId: 6, name: "Unisex Perfume" },
    { catId: 6, name: "Body Mist" },
    { catId: 6, name: "Deodorant" },
    { catId: 6, name: "Perfume Oils" },
    { catId: 6, name: "Gift Sets" },
    { catId: 6, name: "Luxury Fragrances" },
  ];

  let insertedCount = 0;
  for (const item of subcategoriesData) {
    const slug = slugify(item.name);
    await client.query(`
      INSERT INTO subcategories (category_id, name, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (category_id, name) DO UPDATE
      SET updated_at = CURRENT_TIMESTAMP
    `, [item.catId, item.name, slug]);
    insertedCount++;
  }

  const countRes = await client.query("SELECT COUNT(*) FROM subcategories");
  console.log(`✓ Subcategories synced! Total rows in subcategories: ${countRes.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
