# Tama Arts — Premium E-Commerce Platform

A state-of-the-art e-commerce solution built for premium brands. Featuring a seamless variant-switching experience, direct "Buy Now" capabilities, and a comprehensive admin dashboard for sales analytics and product management.

## ✨ Features

### 🛒 Customer Experience
- **Interactive Storefront**: Premium grid with direct "Buy Now" and "Add to Cart" actions.
- **Variant-Sync Gallery**: Product gallery automatically updates based on selected color variant.
- **Real-time Inventory**: Smart stock status ("Only X left!") integrated with variants.
- **Unified Checkout**: Support for multi-item cart purchases and single-item direct buys.
- **Secure Payments**: Integrated with Midtrans Snap for secure and diverse payment options.

### 🛡️ Admin Suite
- **Sales Analytics**: Real-time Gross Revenue, Conversion Rates, and Recent Sales tracking.
- **Product Management**: Full CRUD for products with per-variant image and stock management.
- **Order Tracking**: Monitor order status updates from Midtrans via secure webhooks.
- **RBAC**: Secure role-based access control protecting administrative routes.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Payments**: [Midtrans](https://midtrans.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: Custom premium components inspired by [Shadcn UI](https://ui.shadcn.com/)

---

## 🚀 Usage Guide

### 1. Prerequisites
- Node.js 18+ 
- Clerk Account (API Keys)
- Supabase Project (PostgreSQL URL)
- Midtrans Sandbox Account (Server Key)

### 2. Installation
```bash
git clone https://github.com/your-repo/ecomm.git
cd ecomm
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Supabase)
DATABASE_URL="postgres://..."

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

### 4. Database Migration
```bash
npx prisma migrate dev
```

### 5. Run Development Server
```bash
npm run dev
```

---

## 🔑 Demo Access

### Admin Dashboard
To access the admin features at `/admin`, your user account must have the `ADMIN` role in the database.

**Demo Admin Credentials:**
- **Email:** `eximacbook002@gmail.com` (Simulated Admin)
- **Access:** Logging in with this email automatically grants access to `/admin` routes.

> [!NOTE]
> For local testing, you can use the script at `scripts/make-admin.ts` to elevate any user to Admin status.

---

## 📈 Development Workflow
For an in-depth look at our development methodology and optimized phase ordering, please refer to the [Revised Planning Documentation](docs/revised-planning/README.md).
