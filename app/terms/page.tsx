import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last updated: October 27, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Welcome to ADAZE Marketplace ("we", "us", "our"). These terms and conditions outline the rules and regulations for the use of ADAZE Marketplace's Website, located at adaze.com.
              </p>
              <p>
                By accessing this website, we assume you accept these terms and conditions. Do not continue to use ADAZE Marketplace if you do not agree to all of the terms and conditions stated on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Intellectual Property</h2>
              <p>
                Unless otherwise stated, ADAZE Marketplace and/or its licensors own the intellectual property rights for all material on ADAZE Marketplace. All intellectual property rights are reserved. You may access this from ADAZE Marketplace for your own personal use subjected to restrictions set in these terms and conditions.
              </p>
              <p>You must not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Republish material from ADAZE Marketplace</li>
                <li>Sell, rent, or sub-license material from ADAZE Marketplace</li>
                <li>Reproduce, duplicate, or copy material from ADAZE Marketplace</li>
                <li>Redistribute content from ADAZE Marketplace</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <p>As a user of ADAZE Marketplace, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the platform in compliance with applicable laws</li>
                <li>Respect other users' rights and privacy</li>
                <li>Not engage in fraudulent or deceptive practices</li>
                <li>Report any security vulnerabilities you discover</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Product Listings</h2>
              <p>
                Traders and wholesalers are solely responsible for the accuracy of their product listings. You agree to provide accurate descriptions, pricing, and availability information. 
                You must not list items that are illegal, counterfeit, or prohibited by applicable laws.
              </p>
              <p>
                ADAZE reserves the right to remove or modify any product listing that violates these terms or that we determine at our sole discretion to be objectionable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Transactions & Payments</h2>
              <p>
                All transactions on ADAZE Marketplace are governed by the payment and transaction policies. 
                We use M-Pesa and other payment methods to process payments securely. 
                While we do not control the products or services that are purchased through the platform, 
                we provide tools and systems to facilitate transactions between buyers and sellers.
              </p>
              <p>
                ADAZE charges a commission of 10% on successful transactions. Commission rates may vary for premium trader subscriptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p>
                In no event shall ADAZE Marketplace, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
              <p>
                These terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
              </p>
              <p>
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. 
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these terms at any time. 
                If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. 
                What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
                <br />
                Email: support@adaze.com
                <br />
                Address: Kenya
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}