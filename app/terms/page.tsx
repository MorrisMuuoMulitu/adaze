import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | ADAZE',
  description: 'Terms and conditions for using the ADAZE marketplace',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onAuthClick={() => {}} />
      
      <main className="flex-grow py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900 dark:text-amber-100 m-0">
                  By accessing or using ADAZE, you agree to be bound by these Terms of Service. Please read them carefully.
                </p>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p>By creating an account or using ADAZE, you agree to comply with and be bound by these Terms of Service and our Privacy Policy.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. User Accounts</h2>
              <h3 className="text-xl font-semibold mb-3">Registration</h3>
              <p>To use certain features, you must register for an account. You agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">User Roles</h3>
              <ul>
                <li><strong>Buyers:</strong> Purchase products from traders</li>
                <li><strong>Traders:</strong> List and sell second-hand fashion items</li>
                <li><strong>Transporters:</strong> Deliver orders and earn commissions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. For Traders</h2>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 m-0 mb-2">You agree to:</p>
                    <ul className="text-sm text-green-900 dark:text-green-100 space-y-1 m-0">
                      <li>Only list authentic, quality second-hand items</li>
                      <li>Provide accurate descriptions and photos</li>
                      <li>Honor prices and availability as listed</li>
                      <li>Ship items within 2 business days of payment</li>
                      <li>Package items securely to prevent damage</li>
                      <li>Respond to buyer inquiries promptly</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100 m-0 mb-2">You may not:</p>
                    <ul className="text-sm text-red-900 dark:text-red-100 space-y-1 m-0">
                      <li>Sell counterfeit or stolen goods</li>
                      <li>Misrepresent product condition or quality</li>
                      <li>Engage in price manipulation or fraud</li>
                      <li>Harass or discriminate against buyers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. For Buyers</h2>
              <p>As a buyer, you agree to:</p>
              <ul>
                <li>Make purchases in good faith</li>
                <li>Provide accurate shipping information</li>
                <li>Pay for purchases promptly</li>
                <li>Inspect items upon delivery and report issues within 48 hours</li>
                <li>Leave honest, fair reviews</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Payments and Fees</h2>
              <h3 className="text-xl font-semibold mb-3">Accepted Payment Methods</h3>
              <ul>
                <li>M-Pesa (Kenya)</li>
                <li>Credit/Debit Cards (via Stripe)</li>
                <li>PayPal (international)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Platform Fees</h3>
              <ul>
                <li><strong>Buyers:</strong> No fees - shop for free!</li>
                <li><strong>Traders:</strong> 5% commission on each sale</li>
                <li><strong>Transporters:</strong> Earn 10% of delivery fee</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Shipping and Delivery</h2>
              <ul>
                <li>Traders must ship within 2 business days of payment confirmation</li>
                <li>Transporters must deliver within agreed timeframes</li>
                <li>Track your orders in real-time through the platform</li>
                <li>Report delivery issues immediately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Returns and Refunds</h2>
              <ul>
                <li>Items must match their description and photos</li>
                <li>Report issues within 48 hours of delivery</li>
                <li>Returns accepted for damaged, defective, or misrepresented items</li>
                <li>Refunds processed within 5-7 business days</li>
                <li>Return shipping costs may apply depending on the reason</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Prohibited Activities</h2>
              <p>You may not:</p>
              <ul>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Post fraudulent, misleading, or harmful content</li>
                <li>Use the platform for money laundering or illegal activities</li>
                <li>Harass, threaten, or discriminate against other users</li>
                <li>Attempt to hack, disrupt, or damage the platform</li>
                <li>Create multiple accounts to manipulate reviews or ratings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Content and Intellectual Property</h2>
              <ul>
                <li>You retain ownership of content you post (photos, descriptions, reviews)</li>
                <li>By posting, you grant ADAZE a license to use, display, and distribute your content</li>
                <li>You must own or have rights to any content you upload</li>
                <li>ADAZE trademarks, logos, and platform design are our property</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Dispute Resolution</h2>
              <p>If disputes arise between users:</p>
              <ul>
                <li>First, attempt to resolve directly with the other party</li>
                <li>Contact ADAZE support for mediation</li>
                <li>We may suspend accounts involved in serious disputes</li>
                <li>Disputes are subject to Kenyan law and jurisdiction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that:</p>
              <ul>
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Receive multiple complaints from users</li>
                <li>Remain inactive for extended periods</li>
              </ul>
              <p>You may also close your account at any time from your settings.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Limitation of Liability</h2>
              <p>ADAZE provides a platform to connect buyers, traders, and transporters. We are not responsible for:</p>
              <ul>
                <li>Quality, safety, or legality of items listed</li>
                <li>Accuracy of listings or user-generated content</li>
                <li>Ability of users to complete transactions</li>
                <li>Actions or conduct of platform users</li>
              </ul>
              <p>Use the platform at your own risk. Our liability is limited to the fullest extent permitted by law.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p>We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">14. Contact Us</h2>
              <p>Questions about these terms? Contact us:</p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:legal@adaze.co.ke">legal@adaze.co.ke</a></li>
                <li><strong>Phone:</strong> +254 700 123 456</li>
                <li><strong>Support:</strong> <a href="/help">Help Center</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
