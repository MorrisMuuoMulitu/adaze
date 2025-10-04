# 🛍️ ADAZE - Modern Mitumba Marketplace

A full-stack e-commerce platform connecting buyers, traders, and transporters in Kenya's second-hand clothing market (mitumba).

[![Netlify Status](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=flat-square&logo=netlify)](https://adaze.netlify.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

## 🌟 Features

### For Buyers 🛒
- Browse thousands of quality second-hand clothing items
- Advanced search and filtering (size, condition, location, price)
- Shopping cart and wishlist functionality
- Multiple payment options (M-Pesa, Stripe, PayPal)
- Order tracking with real-time updates
- Product reviews and ratings
- Personalized buyer dashboard with spending analytics

### For Traders 💼
- Easy product listing and management
- Inventory tracking with stock quantities
- Order fulfillment system
- Revenue analytics and reporting
- Customer management
- Product performance insights
- Trader dashboard with sales metrics

### For Transporters 🚚
- Available delivery assignments
- Route optimization
- Earnings tracking (10% commission)
- Delivery status management
- Performance metrics dashboard
- Real-time notifications

### Platform Features ⚡
- **Multi-role System**: Buyer, Trader, Transporter, Admin
- **Authentication**: Email/password and Google OAuth
- **Real-time Updates**: Instant notifications and order status
- **Responsive Design**: Mobile-first, works on all devices
- **Dark/Light Mode**: Theme switching support
- **Multi-language**: English and Swahili support
- **PWA Ready**: Install as mobile app
- **Live Chat**: Customer support integration
- **Payment Integration**: M-Pesa, Stripe, PayPal
- **Search & Filters**: Advanced product discovery
- **Reviews & Ratings**: Community-driven trust system

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, Google OAuth)
- **Storage**: Supabase Storage (avatar & product images)
- **Real-time**: Supabase Realtime subscriptions
- **API**: Next.js API Routes

### Payments
- **M-Pesa**: Daraja API (Safaricom)
- **International**: Stripe (planned)
- **PayPal**: Integration (planned)

### Deployment
- **Hosting**: Netlify
- **CI/CD**: Automatic deployment from GitHub
- **Domain**: adaze.netlify.app / adaze.com

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- M-Pesa developer account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/adaze.git
cd adaze
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# M-Pesa (Safaricom Daraja API)
NEXT_PUBLIC_MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
NEXT_PUBLIC_MPESA_SHORTCODE=174379
NEXT_PUBLIC_MPESA_ENV=sandbox
NEXT_PUBLIC_MPESA_CALLBACK_URL=your_callback_url

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

4. **Database Setup**

Run the SQL scripts in Supabase SQL Editor:
- `supabase-setup.sql` - Main schema
- `fix-avatars-policies.sql` - Storage policies

5. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 User Roles

### Buyer
- Browse and purchase products
- Manage cart and wishlist
- Track orders
- Leave reviews

### Trader
- List and manage products
- Process orders
- View sales analytics
- Manage inventory

### Transporter
- Accept delivery assignments
- Update delivery status
- Track earnings
- View performance metrics

### Admin
- User management
- Platform settings
- Analytics overview
- Content moderation

## 🏗️ Project Structure

```
adaze/
├── app/                      # Next.js App Router pages
│   ├── marketplace/          # Product browsing
│   ├── dashboard/            # Role-specific dashboards
│   ├── products/             # Product management
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout process
│   ├── orders/               # Order management
│   └── ...
├── components/               # React components
│   ├── layout/               # Navbar, Footer
│   ├── sections/             # Landing page sections
│   ├── ui/                   # shadcn/ui components
│   └── ...
├── lib/                      # Utilities and services
│   ├── supabase/             # Supabase client
│   ├── productService.ts     # Product operations
│   ├── cartService.ts        # Cart operations
│   └── ...
├── public/                   # Static assets
└── styles/                   # Global styles
```

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Role-based access control
- Secure authentication with JWT
- Protected API routes
- Input validation with Zod
- XSS and CSRF protection
- Secure payment handling

## 📊 Database Schema

Key tables:
- `profiles` - User profiles with roles
- `products` - Product listings
- `orders` - Order records
- `order_items` - Order line items
- `cart` - Shopping cart items
- `wishlist` - Saved products
- `reviews` - Product reviews
- `notifications` - User notifications

## 🎨 Design System

- **Colors**: Primary (Blue), Accent (Purple), Success (Green)
- **Typography**: Inter font family
- **Components**: shadcn/ui design system
- **Animations**: Subtle, purposeful transitions
- **Mobile-first**: Responsive on all screen sizes

## 🚢 Deployment

### Netlify Deployment

1. Push to GitHub
2. Connect repository to Netlify
3. Configure environment variables
4. Deploy automatically on push

### Build Command
```bash
npm run build
```

### Environment Variables
Set all `.env.local` variables in Netlify dashboard

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered product recommendations
- [ ] Chat between buyers and traders
- [ ] Video product tours
- [ ] Social media integration
- [ ] Referral program
- [ ] Subscription plans for traders
- [ ] Multi-vendor support
- [ ] Advanced search with ML

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👨‍💻 Developer

Built with ❤️ by the ADAZE Team

## 📞 Support

- **Website**: [adaze.netlify.app](https://adaze.netlify.app)
- **Email**: support@adaze.com
- **Documentation**: See `/docs` folder

## 🙏 Acknowledgments

- shadcn for the amazing UI component library
- Supabase team for the backend infrastructure
- Next.js team for the excellent framework
- The open-source community

---

**ADAZE** - Transforming the mitumba marketplace in Kenya 🇰🇪
