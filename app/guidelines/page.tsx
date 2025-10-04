import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Users, Heart, Shield, Star, MessageCircle, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Community Guidelines | ADAZE',
  description: 'Guidelines for being a great member of the ADAZE community',
};

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onAuthClick={() => {}} />
      
      <main className="flex-grow py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Community Guidelines
            </h1>
            <p className="text-muted-foreground text-lg">
              Creating a safe, respectful, and thriving marketplace for everyone
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100 m-0">
                  ADAZE is built on trust, respect, and community. These guidelines help everyone have a positive experience on our platform.
                </p>
              </div>
            </div>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">Be Respectful</h2>
              </div>
              <p>Treat all community members with kindness and respect:</p>
              <ul>
                <li>Use polite and professional language in all communications</li>
                <li>Be patient with buyers, traders, and transporters</li>
                <li>Respect cultural diversity across Kenya's 47 counties</li>
                <li>Avoid discriminatory or hateful speech based on tribe, religion, gender, or location</li>
                <li>Disagree respectfully if you have concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">Be Honest</h2>
              </div>
              <p>Honesty builds trust in our community:</p>
              <ul>
                <li><strong>Accurate Listings:</strong> Describe products truthfully with clear photos showing actual condition</li>
                <li><strong>Honest Reviews:</strong> Share genuine experiences without exaggeration</li>
                <li><strong>Transparent Pricing:</strong> Price items fairly and honor listed prices</li>
                <li><strong>Real Photos:</strong> Use your own photos, not stock images</li>
                <li><strong>Genuine Accounts:</strong> One person, one account</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">Deliver Quality</h2>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">For Traders:</h3>
              <ul>
                <li>Only list items in good, wearable condition</li>
                <li>Clean and prepare items before shipping</li>
                <li>Package items securely to prevent damage</li>
                <li>Ship within 2 business days of payment</li>
                <li>Respond to inquiries within 24 hours</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">For Transporters:</h3>
              <ul>
                <li>Deliver orders safely and on time</li>
                <li>Handle packages with care</li>
                <li>Communicate delivery updates promptly</li>
                <li>Be professional and courteous with customers</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">For Buyers:</h3>
              <ul>
                <li>Make purchases in good faith</li>
                <li>Provide accurate shipping information</li>
                <li>Inspect items upon delivery</li>
                <li>Report issues within 48 hours</li>
                <li>Leave fair, honest reviews</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">Communicate Clearly</h2>
              </div>
              <p>Good communication prevents misunderstandings:</p>
              <ul>
                <li>Respond to messages promptly (within 24 hours)</li>
                <li>Be clear about product details, shipping times, and policies</li>
                <li>Update buyers on order status proactively</li>
                <li>If problems arise, communicate early and work together to resolve them</li>
                <li>Use the platform's messaging system for all communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-bold m-0">What's Not Allowed</h2>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <p className="font-semibold mb-3">Prohibited activities include:</p>
                <ul className="space-y-2">
                  <li><strong>Counterfeit Goods:</strong> Selling fake designer items or replicas</li>
                  <li><strong>Stolen Items:</strong> Selling items you don't legally own</li>
                  <li><strong>Fraud:</strong> Scams, fake payments, or misleading buyers</li>
                  <li><strong>Harassment:</strong> Bullying, threats, or abusive behavior</li>
                  <li><strong>Spam:</strong> Excessive messaging or unsolicited promotions</li>
                  <li><strong>Review Manipulation:</strong> Fake reviews, paying for reviews, or pressuring buyers</li>
                  <li><strong>Off-Platform Transactions:</strong> Attempting to bypass ADAZE for payment</li>
                  <li><strong>Price Gouging:</strong> Unreasonably inflating prices to exploit buyers</li>
                  <li><strong>Discrimination:</strong> Refusing service based on tribe, religion, gender, or location</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Consequences of Violations</h2>
              <p>We take guideline violations seriously. Depending on severity, actions may include:</p>
              <ul>
                <li><strong>Warning:</strong> First-time minor violations receive a warning</li>
                <li><strong>Listing Removal:</strong> Problematic listings are removed</li>
                <li><strong>Temporary Suspension:</strong> Account suspended for 7-30 days</li>
                <li><strong>Permanent Ban:</strong> Severe or repeat violations result in permanent removal</li>
                <li><strong>Legal Action:</strong> Fraud or illegal activity may be reported to authorities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Reporting Violations</h2>
              <p>If you encounter behavior that violates these guidelines:</p>
              <ul>
                <li>Use the "Report" button on listings or user profiles</li>
                <li>Provide specific details and evidence (screenshots, messages)</li>
                <li>Contact support at <a href="mailto:support@adaze.co.ke">support@adaze.co.ke</a></li>
                <li>We review all reports within 24-48 hours</li>
              </ul>
              <p><strong>False reports may result in account penalties.</strong></p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Building Our Community Together</h2>
              <p>ADAZE thrives when everyone contributes positively:</p>
              <ul>
                <li>Welcome new members and help them learn the platform</li>
                <li>Share tips and advice with other traders</li>
                <li>Celebrate successful transactions with positive feedback</li>
                <li>Support local traders in your county</li>
                <li>Promote sustainable fashion through second-hand shopping</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Questions or Feedback?</h2>
              <p>These guidelines evolve with our community. If you have questions or suggestions:</p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:community@adaze.co.ke">community@adaze.co.ke</a></li>
                <li><strong>Help Center:</strong> <a href="/help">Visit Help Center</a></li>
                <li><strong>Phone:</strong> +254 700 123 456</li>
              </ul>
            </section>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border mt-8">
              <p className="text-center font-semibold text-lg mb-2">
                Together, we're building Kenya's most trusted marketplace! 🇰🇪
              </p>
              <p className="text-center text-muted-foreground">
                Thank you for being a valuable member of the ADAZE community.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
