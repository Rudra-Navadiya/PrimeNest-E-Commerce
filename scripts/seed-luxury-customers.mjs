import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "primenest_db",
  password: String(process.env.DB_PASSWORD || "123456"),
  port: Number(process.env.DB_PORT || 5432),
});

const CUSTOMER_LIST = [
  { name: "Aarav Mehta", email: "aarav.mehta.luxury@gmail.com", phone: "9820145210", gender: "male", dob: "1988-04-12", address: "14B, Samudra Mahal, Dr. Annie Besant Road, Worli", city: "Mumbai", state: "Maharashtra", pin: "400018" },
  { name: "Ananya Singhania", email: "ananya.singhania.delhi@outlook.com", phone: "9811234567", gender: "female", dob: "1992-08-25", address: "B-4/18, Vasant Vihar, Poorvi Marg", city: "New Delhi", state: "Delhi", pin: "110057" },
  { name: "Kabir Kapoor", email: "kabir.kapoor.estates@gmail.com", phone: "9821098765", gender: "male", dob: "1985-11-19", address: "702, Silver Sands, Perry Cross Road, Bandra West", city: "Mumbai", state: "Maharashtra", pin: "400050" },
  { name: "Meera Oberoi", email: "meera.oberoi.design@gmail.com", phone: "9845012345", gender: "female", dob: "1990-03-14", address: "104, 12th Main Road, HAL 2nd Stage, Indiranagar", city: "Bengaluru", state: "Karnataka", pin: "560038" },
  { name: "Rohan Singhal", email: "rohan.singhal.capital@gmail.com", phone: "9910045678", gender: "male", dob: "1987-07-30", address: "Penthouse 4, The Aralias, DLF Phase 5, Golf Course Road", city: "Gurgaon", state: "Haryana", pin: "122009" },
  { name: "Tara Deshmukh", email: "tara.deshmukh.pune@gmail.com", phone: "9822054321", gender: "female", dob: "1994-01-22", address: "Villa 8, Lane 5, Koregaon Park", city: "Pune", state: "Maharashtra", pin: "411001" },
  { name: "Vikram Mittal", email: "vikram.mittal.inv@gmail.com", phone: "9810012349", gender: "male", dob: "1983-09-05", address: "42, Golf Links Road", city: "New Delhi", state: "Delhi", pin: "110003" },
  { name: "Natasha Godrej", email: "natasha.godrej.style@gmail.com", phone: "9820087654", gender: "female", dob: "1991-06-18", address: "B-12, Sagar Sangeet, 58 Walkeshwar Road, Malabar Hill", city: "Mumbai", state: "Maharashtra", pin: "400006" },
  { name: "Aryan Dalal", email: "aryan.dalal.ventures@gmail.com", phone: "9879012345", gender: "male", dob: "1989-12-08", address: "301, Bodakdev Royal Residency, Judges Bungalow Road", city: "Ahmedabad", state: "Gujarat", pin: "380054" },
  { name: "Priyanka Birla", email: "priyanka.birla.art@gmail.com", phone: "9830023456", gender: "female", dob: "1993-05-17", address: "18/2, Burdwan Road, Alipore", city: "Kolkata", state: "West Bengal", pin: "700027" },
  { name: "Devendra Ambani", email: "devendra.ambani.corp@gmail.com", phone: "9820034567", gender: "male", dob: "1982-10-10", address: "12A, Sea Face Park, Bhulabhai Desai Road, Cumballa Hill", city: "Mumbai", state: "Maharashtra", pin: "400026" },
  { name: "Aisha Patel", email: "aisha.patel.jewels@gmail.com", phone: "9825045678", gender: "female", dob: "1995-02-14", address: "402, Riverfront Palazzo, Piplod Main Road", city: "Surat", state: "Gujarat", pin: "395007" },
  { name: "Siddharth Rao", email: "siddharth.rao.tech@gmail.com", phone: "9849012345", gender: "male", dob: "1986-07-04", address: "Plot 84, Road No. 36, Jubilee Hills", city: "Hyderabad", state: "Telangana", pin: "500033" },
  { name: "Rhea Sen", email: "rhea.sen.editorial@gmail.com", phone: "9831098765", gender: "female", dob: "1991-11-28", address: "55A, Ballygunge Circular Road", city: "Kolkata", state: "West Bengal", pin: "700019" },
  { name: "Advait Nair", email: "advait.nair.ai@gmail.com", phone: "9845198765", gender: "male", dob: "1988-03-09", address: "18, Sankey Road, Sadashivnagar", city: "Bengaluru", state: "Karnataka", pin: "560080" },
  { name: "Sanjana Goenka", email: "sanjana.goenka.delhi@gmail.com", phone: "9811087654", gender: "female", dob: "1994-09-15", address: "M-45, Greater Kailash Part 2, Hansraj Gupta Marg", city: "New Delhi", state: "Delhi", pin: "110048" },
  { name: "Karan Johar", email: "karan.johar.films@gmail.com", phone: "9820123456", gender: "male", dob: "1980-05-25", address: "11, Sea Breeze Bungalows, Juhu Tara Road", city: "Mumbai", state: "Maharashtra", pin: "400049" },
  { name: "Diya Reddy", email: "diya.reddy.health@gmail.com", phone: "9849123456", gender: "female", dob: "1992-12-03", address: "House 24, Road No. 12, Banjara Hills", city: "Hyderabad", state: "Telangana", pin: "500034" },
  { name: "Yashvardhan Shekhawat", email: "yashvardhan.heritage@gmail.com", phone: "9829012345", gender: "male", dob: "1984-08-19", address: "Haveli 7, Bhagwan Das Road, C-Scheme", city: "Jaipur", state: "Rajasthan", pin: "302001" },
  { name: "Alisha Merchant", email: "alisha.merchant.gems@gmail.com", phone: "9820234567", gender: "female", dob: "1993-04-07", address: "The Summit, 31 Altamount Road, Cumballa Hill", city: "Mumbai", state: "Maharashtra", pin: "400026" },
  { name: "Varun Bajaj", email: "varun.bajaj.auto@gmail.com", phone: "9822123456", gender: "male", dob: "1987-02-23", address: "Row House 3, Central Avenue, Kalyani Nagar", city: "Pune", state: "Maharashtra", pin: "411006" },
  { name: "Tanya Chawla", email: "tanya.chawla.law@gmail.com", phone: "9814012345", gender: "female", dob: "1990-10-11", address: "Kothi 512, Sector 9-D", city: "Chandigarh", state: "Chandigarh", pin: "160009" },
  { name: "Vivaan Khemka", email: "vivaan.khemka.global@gmail.com", phone: "9810123456", gender: "male", dob: "1985-06-30", address: "14, Malcha Marg, Chanakyapuri", city: "New Delhi", state: "Delhi", pin: "110021" },
  { name: "Ishita Bhattacharya", email: "ishita.bhattacharya.res@gmail.com", phone: "9830123456", gender: "female", dob: "1992-01-18", address: "Tower 2, Block IB, Sector III, Salt Lake", city: "Kolkata", state: "West Bengal", pin: "700106" },
  { name: "Rehan Qureshi", email: "rehan.qureshi.lko@gmail.com", phone: "9839012345", gender: "male", dob: "1989-05-14", address: "5/12, Vipul Khand, Gomti Nagar", city: "Lucknow", state: "Uttar Pradesh", pin: "226010" },
  { name: "Kiara Advani", email: "kiara.advani.glam@gmail.com", phone: "9820345678", gender: "female", dob: "1993-07-31", address: "Apartment 901, Supreme Villa, 14th Road, Khar West", city: "Mumbai", state: "Maharashtra", pin: "400052" },
  { name: "Nikhil Nambiar", email: "nikhil.nambiar.marine@gmail.com", phone: "9847012345", gender: "male", dob: "1986-09-27", address: "Skyline Imperial, Panampilly Nagar Main Avenue", city: "Kochi", state: "Kerala", pin: "682036" },
  { name: "Simran Wadhwa", email: "simran.wadhwa.curator@gmail.com", phone: "9811239876", gender: "female", dob: "1991-03-22", address: "B-22, Panchsheel Park North", city: "New Delhi", state: "Delhi", pin: "110017" },
  { name: "Arjun Mahindra", email: "arjun.mahindra.auto@gmail.com", phone: "9820456789", gender: "male", dob: "1983-12-14", address: "19, Olympus Apartments, Altamount Road", city: "Mumbai", state: "Maharashtra", pin: "400026" },
  { name: "Mallika Sarabhai", email: "mallika.sarabhai.theatre@gmail.com", phone: "9879123456", gender: "female", dob: "1988-08-05", address: "Darpana Villa, Usmanpura, Riverfront", city: "Ahmedabad", state: "Gujarat", pin: "380013" },
  { name: "Kunal Varma", email: "kunal.varma.equity@gmail.com", phone: "9845234567", gender: "male", dob: "1984-04-16", address: "Penthouse 6, Lavelle Mansions, Lavelle Road", city: "Bengaluru", state: "Karnataka", pin: "560001" },
  { name: "Samaira Kothari", email: "samaira.kothari.chennai@gmail.com", phone: "9840012345", gender: "female", dob: "1994-06-21", address: "12, Boat Club Road, Raja Annamalai Puram", city: "Chennai", state: "Tamil Nadu", pin: "600028" },
  { name: "Raghavendra Somani", email: "raghav.somani.mills@gmail.com", phone: "9826012345", gender: "male", dob: "1985-01-11", address: "Bungalow 4, Scheme 54, Vijay Nagar", city: "Indore", state: "Madhya Pradesh", pin: "452010" },
  { name: "Avani Jindal", email: "avani.jindal.steel@gmail.com", phone: "9810234567", gender: "female", dob: "1990-11-04", address: "Plot 3, Shanti Niketan Marg", city: "New Delhi", state: "Delhi", pin: "110021" },
  { name: "Hridaan Morakhia", email: "hridaan.morakhia.fin@gmail.com", phone: "9820567890", gender: "male", dob: "1987-10-29", address: "2402, NCPA Apartments, Dorabaji Tata Road, Nariman Point", city: "Mumbai", state: "Maharashtra", pin: "400021" },
  { name: "Zoya Akhtar", email: "zoya.akhtar.cinema@gmail.com", phone: "9820678901", gender: "female", dob: "1982-10-14", address: "Gulliver Bungalow, Union Park, Pali Hill, Bandra West", city: "Mumbai", state: "Maharashtra", pin: "400050" },
  { name: "Prateek Poddar", email: "prateek.poddar.heritage@gmail.com", phone: "9830234567", gender: "male", dob: "1986-06-19", address: "Queens Mansion, 12 Park Street", city: "Kolkata", state: "West Bengal", pin: "700016" },
  { name: "Lavanya Sundaram", email: "lavanya.sundaram.silk@gmail.com", phone: "9840123456", gender: "female", dob: "1993-02-09", address: "Kasturi Estate, 10 Poes Garden", city: "Chennai", state: "Tamil Nadu", pin: "600086" }
];

// Helper to generate a random timestamp between minDaysAgo and maxDaysAgo
function getRandomDate(minDaysAgo, maxDaysAgo) {
  const now = new Date("2026-10-06T12:00:00Z");
  const daysAgo = minDaysAgo + Math.random() * (maxDaysAgo - minDaysAgo);
  const targetTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return targetTime;
}

// Function to find a combination of products matching [minTotal, maxTotal]
function composeOrderCart(products, minTotal = 20000, maxTotal = 150000) {
  const highTier = products.filter(p => Number(p.price) >= 15000);
  const midTier = products.filter(p => Number(p.price) >= 4000 && Number(p.price) < 15000);
  const anyTier = products.filter(p => Number(p.price) >= 1000);

  for (let attempt = 0; attempt < 50; attempt++) {
    const items = [];
    let currentTotal = 0;

    // Pick 1 primary anchor luxury piece (e.g. Lehenga or high-end watch)
    const anchor = highTier[Math.floor(Math.random() * highTier.length)];
    const anchorQty = 1;
    items.push({
      productId: anchor.id,
      productName: anchor.name,
      unitPrice: Number(anchor.price),
      quantity: anchorQty,
    });
    currentTotal += Number(anchor.price) * anchorQty;

    // Decide how many companion items to add (0 to 3)
    const companionCount = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < companionCount; c++) {
      const companionPool = currentTotal < 50000 ? midTier : anyTier;
      const candidate = companionPool[Math.floor(Math.random() * companionPool.length)];
      if (items.some(it => it.productId === candidate.id)) continue;

      const qty = Math.random() > 0.8 ? 2 : 1;
      const addition = Number(candidate.price) * qty;

      if (currentTotal + addition <= maxTotal) {
        items.push({
          productId: candidate.id,
          productName: candidate.name,
          unitPrice: Number(candidate.price),
          quantity: qty,
        });
        currentTotal += addition;
      }
    }

    if (currentTotal >= minTotal && currentTotal <= maxTotal) {
      return { items, total: currentTotal };
    }
  }

  // Fallback guaranteed combination
  const anchor = highTier[0]; // e.g. Rania Blouse and Lehenga (₹82,499)
  return {
    items: [
      {
        productId: anchor.id,
        productName: anchor.name,
        unitPrice: Number(anchor.price),
        quantity: 1
      }
    ],
    total: Number(anchor.price)
  };
}

async function run() {
  console.log("=== PRIMENEST LUXURY CUSTOMER & ORDER SEEDING ===");
  console.log(`Target: ${CUSTOMER_LIST.length} High-Net-Worth Customers with Orders between ₹20,000 and ₹150,000`);
  console.log("Timeframe: Last 2 Months (August 6, 2026 to October 6, 2026)\n");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Fetch available products
    const productResult = await client.query(
      "SELECT id, name, price, stock FROM products WHERE price > 0 ORDER BY price DESC"
    );
    const products = productResult.rows;
    if (products.length === 0) {
      throw new Error("No products found in database!");
    }
    console.log(`Found ${products.length} products to build authentic order items from.`);

    const passwordHash = bcrypt.hashSync("PrimeNest@2026", 10);
    const createdCustomers = [];
    const createdOrders = [];
    let grandRevenue = 0;

    for (let i = 0; i < CUSTOMER_LIST.length; i++) {
      const cust = CUSTOMER_LIST[i];

      // Check if user already exists
      const existingUser = await client.query(
        "SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)",
        [cust.email]
      );

      let userId;
      // Account created between 58 and 10 days ago
      const userCreatedDate = getRandomDate(10, 58);

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
      } else {
        const userInsert = await client.query(
          `INSERT INTO users (
            name, email, password_hash, role, phone, date_of_birth, gender, created_at, updated_at
          ) VALUES ($1, $2, $3, 'user', $4, $5, $6, $7, $7)
          RETURNING id, name, email`,
          [
            cust.name,
            cust.email,
            passwordHash,
            cust.phone,
            cust.dob,
            cust.gender,
            userCreatedDate
          ]
        );
        userId = userInsert.rows[0].id;

        // Insert Default Address
        await client.query(
          `INSERT INTO user_addresses (
            user_id, full_name, phone, address_line, city, state, postal_code, country, is_default, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'India', true, $8, $8)`,
          [
            userId,
            cust.name,
            cust.phone,
            cust.address,
            cust.city,
            cust.state,
            cust.pin,
            userCreatedDate
          ]
        );
      }

      createdCustomers.push({ id: userId, name: cust.name, email: cust.email });

      // Generate 1 to 2 orders for this customer within the last 60 days
      const ordersCount = Math.random() < 0.35 ? 2 : 1;

      for (let o = 0; o < ordersCount; o++) {
        // Order date must be on or after user creation date, but before now
        const minDays = 0.5; // at most 12 hours ago
        const maxDays = (Date.now() - userCreatedDate.getTime()) / (1000 * 60 * 60 * 24);
        const orderDate = getRandomDate(minDays, Math.max(minDays + 1, maxDays));

        // Compose cart strictly within [20000, 150000]
        const cart = composeOrderCart(products, 20000, 150000);

        // Determine realistic status based on age
        const daysOld = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        let status = "delivered";
        let paymentStatus = "completed";
        if (daysOld < 2) {
          status = Math.random() > 0.5 ? "confirmed" : "processing";
        } else if (daysOld < 5) {
          status = "shipped";
        }

        const paymentMethods = ["upi", "credit_card", "net_banking", "cod"];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        const fullAddress = `${cust.address}, ${cust.city}, ${cust.state} - ${cust.pin}, India`;

        // Insert order
        const orderRes = await client.query(
          `INSERT INTO orders (
            customer_name, email, phone, address, total, status, payment_method, payment_status, user_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
          RETURNING id, total, status, created_at`,
          [
            cust.name,
            cust.email,
            cust.phone,
            fullAddress,
            cart.total.toFixed(2),
            status,
            paymentMethod,
            paymentStatus,
            userId,
            orderDate
          ]
        );

        const orderId = orderRes.rows[0].id;
        grandRevenue += cart.total;
        createdOrders.push({
          id: orderId,
          customer: cust.name,
          email: cust.email,
          total: cart.total,
          status,
          date: orderDate.toISOString().split("T")[0]
        });

        // Insert order items
        for (const item of cart.items) {
          await client.query(
            `INSERT INTO order_items (
              order_id, product_id, product_name, quantity, unit_price, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              orderId,
              item.productId,
              item.productName,
              item.quantity,
              item.unitPrice.toFixed(2),
              orderDate
            ]
          );
        }
      }
    }

    await client.query("COMMIT");

    console.log("\n================ SEEDING COMPLETE ================");
    console.log(`✅ Total Registered Customers Added: ${createdCustomers.length}`);
    console.log(`✅ Total High-Value Orders Created:   ${createdOrders.length}`);
    console.log(`✅ Combined Luxury Order Revenue:    ₹${grandRevenue.toLocaleString("en-IN")}`);

    const totals = createdOrders.map(o => o.total);
    const minOrder = Math.min(...totals);
    const maxOrder = Math.max(...totals);
    const avgOrder = grandRevenue / createdOrders.length;

    console.log(`✅ Minimum Order Value:               ₹${minOrder.toLocaleString("en-IN")} (Constraint: >= ₹20,000)`);
    console.log(`✅ Maximum Order Value:               ₹${maxOrder.toLocaleString("en-IN")} (Constraint: <= ₹150,000)`);
    console.log(`✅ Average Order Value:               ₹${Math.round(avgOrder).toLocaleString("en-IN")}`);

    const dates = createdOrders.map(o => o.date).sort();
    console.log(`✅ Order Date Range:                  ${dates[0]} to ${dates[dates.length - 1]} (Within last 2 months)`);
    console.log("===================================================\n");

    console.log("Sample 5 Created Customers & Orders:");
    for (let s = 0; s < Math.min(5, createdOrders.length); s++) {
      const o = createdOrders[s];
      console.log(`  - Order #${o.id} | Customer: ${o.customer} (${o.email}) | ₹${o.total.toLocaleString("en-IN")} | ${o.status.toUpperCase()} | Date: ${o.date}`);
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding customers:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
