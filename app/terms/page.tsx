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
              <p className="text-muted-foreground">
                Welcome to Adaze. By accessing our website and using our services, you agree to be bound by these Terms of Service.
                &quot;Adaze&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot; refers to the Adaze Marketplace platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <p className="text-muted-foreground mb-2">
                To use certain features of the platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update your information if it changes</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Buying and Selling</h2>
              <p className="text-muted-foreground mb-2">
                <strong>Sellers:</strong> You represent that you have the right to sell the items you list and that they comply with our prohibited items policy.
              </p>
              <p className="text-muted-foreground">
                <strong>Buyers:</strong> You agree to pay for items you purchase and comply with our transaction policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Content and Conduct</h2>
              <p className="text-muted-foreground">
                You retain ownership of content you post but grant us a license to use it. You agree not to post content that is illegal, offensive, or infringes on others&apos; rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Adaze is provided &quot;as is&quot;. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
              </p>
              <p className="text-muted-foreground mt-2">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right, at our sole discretion, to modify or replace these terms at any time.
                If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect.
                What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground">
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