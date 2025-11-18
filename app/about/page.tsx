import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">About ADAZE</CardTitle>
            <p className="text-muted-foreground">Transforming the mitumba marketplace in Kenya</p>
          </CardHeader>
          <CardContent className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p>
                ADAZE is a modern e-commerce platform connecting buyers, traders, and transporters in Kenya&apos;s vibrant second-hand clothing market, known locally as &quot;mitumba&quot;. Our platform was built specifically for the unique needs of the Kenyan market, combining traditional commerce with modern technology.
              </p>
              <p>
                We understand the importance of mitumba in the Kenyan economy - it provides affordable clothing options while creating employment opportunities across the value chain, from importers to traders, and transporters.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p>
                Our mission is to create a seamless, efficient, and trustworthy marketplace that connects all stakeholders in the mitumba value chain. We aim to digitize and modernize the traditional mitumba trade while preserving its economic benefits for all participants.
              </p>
              <p>
                By leveraging technology like M-Pesa for payments and real-time logistics coordination, we&apos;re making the mitumba business more accessible, transparent, and profitable for everyone involved.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p>
                We envision a fully digitized mitumba ecosystem where importers can efficiently connect with wholesalers, wholesalers with traders, traders with buyers, and all with reliable transporters. Our platform will serve as the central hub for all mitumba-related commerce in Kenya.
              </p>
              <p className="text-muted-foreground mb-4">
                We&apos;re building a community where style meets sustainability.
              </p>
              <p className="text-muted-foreground">
                &quot;Adaze&quot; means &quot;Style&quot; in our local dialect.
              </p>
            </section>

            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-lg bg-card">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Community First</h3>
                  <p className="text-muted-foreground">
                    We believe in the power of connection. Our platform isn&apos;t just about transactions; it&apos;s about building relationships.
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-card">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
                  <p className="text-muted-foreground">
                    Your safety is our priority. We verify sellers and secure every transaction so you can shop with peace of mind.
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-card">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Quality & Style</h3>
                  <p className="text-muted-foreground">
                    We curate the best. From vintage gems to modern streetwear, find pieces that tell a story and elevate your look.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Platform</h2>
              <p>
                ADAZE provides a comprehensive ecosystem with four key user types:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Buyers:</strong> Individuals looking for quality second-hand clothing at affordable prices</li>
                <li><strong>Traders:</strong> Retailers who buy from wholesalers and sell directly to consumers</li>
                <li><strong>Wholesalers:</strong> Importers and bulk distributors who supply traders with inventory</li>
                <li><strong>Transporters:</strong> Logistics providers who handle the delivery of goods across the value chain</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
              <p>
                Built with cutting-edge technology including Next.js, Supabase, and M-Pesa integration, ADAZE provides a seamless experience across all devices. Our real-time notification system ensures all stakeholders stay connected and informed about their orders and deliveries.
              </p>
              <p>
                We&apos;ve specially optimized for the Kenyan market with M-Pesa as the primary payment method, which is used by over 95% of the population for digital payments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Join Our Mission</h2>
              <p>
                Whether you&apos;re a buyer, trader, wholesaler, or transporter, ADAZE offers the tools and connections you need to succeed in the mitumba business. Join thousands of users who are already transforming how second-hand clothing is bought and sold in Kenya.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}