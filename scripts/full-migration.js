// scripts/full-migration.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SUPABASE_URL = "https://jvpqalrnfyzsnqmtnqlf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cHFhbHJuZnl6c25xbXRucWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjc4MjYsImV4cCI6MjA3NDcwMzgyNn0.gT0rKyYQhcVB-BbWbKrFF2vO9DwE3KC9nU9U0TEI1a0";

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchData(table) {
  console.log(`📡 Fetching ${table}...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers });
  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Failed to fetch ${table}: ${err}`);
    return [];
  }
  return await res.json();
}

async function main() {
  try {
    // 1. Migrate Profiles -> Users
    const profiles = await fetchData('profiles');
    for (const p of profiles) {
      await prisma.user.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.full_name,
          email: `${p.id}@adaze-migrated.com`, // Placeholder
          phone: p.phone,
          location: p.location,
          image: p.avatar_url,
          role: p.role?.toUpperCase() || 'BUYER',
          isSuspended: p.is_suspended || false,
          isDeleted: p.is_deleted || false,
          deletedAt: p.deleted_at ? new Date(p.deleted_at) : null,
          suspendedAt: p.suspended_at ? new Date(p.suspended_at) : null,
          lastLoginAt: p.last_login_at ? new Date(p.last_login_at) : null,
          loginCount: p.login_count || 0,
          createdAt: new Date(p.created_at),
        }
      });
    }
    console.log(`✅ Migrated ${profiles.length} users.`);

    // 2. Migrate Products
    const products = await fetchData('products');
    for (const p of products) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          traderId: p.trader_id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          imageUrl: p.image_url,
          stockQuantity: p.stock_quantity || 0,
          rating: p.rating || 0.0,
          status: p.status?.toUpperCase() || 'ACTIVE',
          isFeatured: p.is_featured || false,
          createdAt: new Date(p.created_at),
        }
      });
    }
    console.log(`✅ Migrated ${products.length} products.`);

    // 3. Migrate Orders
    const orders = await fetchData('orders');
    for (const o of orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          buyerId: o.buyer_id,
          traderId: o.trader_id,
          transporterId: o.transporter_id,
          title: o.title,
          description: o.description,
          amount: o.amount,
          status: o.status?.toUpperCase() || 'PENDING',
          shippingAddress: o.shipping_address,
          billingAddress: o.billing_address,
          createdAt: new Date(o.created_at),
          updatedAt: new Date(o.updated_at),
        }
      });
    }
    console.log(`✅ Migrated ${orders.length} orders.`);

    // 4. Migrate Order Items
    const items = await fetchData('order_items');
    for (const i of items) {
      await prisma.orderItem.upsert({
        where: { id: i.id },
        update: {},
        create: {
          id: i.id,
          orderId: i.order_id,
          productId: i.product_id,
          quantity: i.quantity,
          priceAtTime: i.price_at_time,
          createdAt: new Date(i.created_at),
        }
      });
    }
    console.log(`✅ Migrated ${items.length} order items.`);

    // 5. Migrate Reviews
    const reviews = await fetchData('reviews');
    for (const r of reviews) {
      // Find the trader/recipient for the review (Supabase schema uses user_id for reviewer)
      // We need to infer reviewed_id if not present. Defaulting to a known admin or self for now.
      await prisma.review.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          productId: r.product_id,
          orderId: r.order_id,
          reviewerId: r.user_id,
          reviewedId: r.reviewed_id || r.user_id, // Safety fallback
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verifiedPurchase: r.verified_purchase || false,
          helpfulCount: r.helpful_count || 0,
          traderResponse: r.trader_response,
          createdAt: new Date(r.created_at),
        }
      });
    }
    console.log(`✅ Migrated ${reviews.length} reviews.`);

    // 6. Migrate Wishlist & Cart
    const wishlist = await fetchData('wishlist');
    for (const w of wishlist) {
      await prisma.wishlist.upsert({
        where: { userId_productId: { userId: w.user_id, productId: w.product_id } },
        update: {},
        create: { userId: w.user_id, productId: w.product_id, createdAt: new Date(w.created_at) }
      });
    }
    const cart = await fetchData('cart');
    for (const c of cart) {
      await prisma.cartItem.upsert({
        where: { userId_productId: { userId: c.user_id, productId: c.product_id } },
        update: {},
        create: { userId: c.user_id, productId: c.product_id, quantity: c.quantity, createdAt: new Date(c.created_at) }
      });
    }
    console.log(`✅ Migrated wishlist and cart items.`);

    console.log('🏁 DATA MIGRATION COMPLETE!');
  } catch (err) {
    console.error('💥 Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
