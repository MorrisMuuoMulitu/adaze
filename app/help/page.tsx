"use client"

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  HelpCircle, Search, ShoppingBag, Package, Truck, CreditCard, 
  MessageCircle, ChevronDown, ChevronUp, Mail, Phone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const faqs = [
  {
    category: 'Getting Started',
    icon: HelpCircle,
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click the "Get Started" button on the homepage, choose your role (Buyer, Trader, or Transporter), and fill in your details. You can also sign up with Google for faster registration.'
      },
      {
        q: 'What are the different user roles?',
        a: 'Buyers shop for products, Traders sell second-hand fashion items, and Transporters deliver orders and earn commissions.'
      },
      {
        q: 'Is ADAZE available outside Nairobi?',
        a: 'Yes! We deliver to all 47 counties in Kenya, from Nairobi to Mombasa, Kisumu to Eldoret, and everywhere in between.'
      }
    ]
  },
  {
    category: 'Buying',
    icon: ShoppingBag,
    questions: [
      {
        q: 'How do I search for products?',
        a: 'Use the search bar at the top of the marketplace page. You can filter by category, size, condition, location, and price range.'
      },
      {
        q: 'Can I save items for later?',
        a: 'Yes! Click the heart icon on any product to add it to your wishlist. Access your wishlist from the navigation menu.'
      },
      {
        q: 'What if I receive a damaged item?',
        a: 'Report it within 48 hours of delivery. Take photos of the damage and contact support. We\'ll facilitate a return or refund.'
      }
    ]
  },
  {
    category: 'Payments',
    icon: CreditCard,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept M-Pesa (Kenya), Credit/Debit Cards via Stripe, and PayPal for international payments.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely! We use bank-level encryption and never store your full payment card details. All transactions are processed through secure, certified payment gateways.'
      },
      {
        q: 'When will I be charged?',
        a: 'You\'re charged immediately when you place an order. For M-Pesa, you\'ll receive an STK push notification to confirm payment.'
      }
    ]
  },
  {
    category: 'Shipping & Delivery',
    icon: Truck,
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Delivery times vary by location. Within Nairobi: 1-3 days. Other counties: 3-7 days. You can track your order in real-time.'
      },
      {
        q: 'How much does shipping cost?',
        a: 'Shipping costs depend on your location and item size. The exact fee is calculated at checkout based on the trader\'s location and your delivery address.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Go to "My Orders" in your dashboard to see real-time tracking updates from the transporter.'
      }
    ]
  },
  {
    category: 'For Traders',
    icon: Package,
    questions: [
      {
        q: 'How do I start selling on ADAZE?',
        a: 'Register as a Trader, complete your profile, and start listing products. Each product listing requires photos, description, price, and condition details.'
      },
      {
        q: 'What fees does ADAZE charge?',
        a: 'We charge a 5% commission on each successful sale. No listing fees, no hidden charges. You only pay when you make a sale!'
      },
      {
        q: 'How do I get paid?',
        a: 'Payments are released to your M-Pesa account within 24-48 hours after the buyer confirms delivery or after 7 days (whichever comes first).'
      },
      {
        q: 'What items can I sell?',
        a: 'You can sell quality second-hand clothing, shoes, bags, and fashion accessories. Items must be in good, wearable condition.'
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onAuthClick={() => {}} />
      
      <main className="flex-grow py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How Can We Help?
            </h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions or contact our support team
            </p>
          </div>

          {/* Search */}
          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          {/* Quick Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get instant help from our support team
                  </p>
                  <Button size="sm" className="w-full sm:w-auto">
                    Start Chat
                  </Button>
                </div>
              </div>
            </div>

            <Link href="/contact">
              <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Send us a detailed message
                    </p>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                </div>
                <div className="space-y-3">
                  {category.questions.map((item, itemIndex) => {
                    const globalIndex = categoryIndex * 100 + itemIndex;
                    const isOpen = openIndex === globalIndex;
                    
                    return (
                      <div
                        key={itemIndex}
                        className="bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                      >
                        <button
                          onClick={() => handleToggle(globalIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium pr-4">{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-0 text-muted-foreground">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="mt-12 text-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border">
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with Support
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Email
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Or call us: +254 700 123 456</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
