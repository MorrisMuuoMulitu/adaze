import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: October 27, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you use our services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account registration information (name, email, phone number)</li>
                <li>Profile information (location, business details)</li>
                <li>Transaction information (orders, payments)</li>
                <li>Communication preferences and support interactions</li>
                <li>Usage data and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related communications</li>
                <li>Send marketing communications with your consent</li>
                <li>Protect against fraud and ensure security</li>
                <li>Comply with legal obligations</li>
                <li>Personalize your experience on our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers who assist in our operations</li>
                <li>Payment processors for transaction processing</li>
                <li>Transporters for delivery coordination</li>
                <li>Legal authorities when required by law</li>
                <li>Other users as necessary for transaction completion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                These measures include encryption, secure server infrastructure, and access controls.
              </p>
              <p>
                However, no method of transmission over the internet or method of electronic storage is 100% secure,
                and we cannot guarantee absolute security of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and comply with our legal obligations.
                Specific retention periods vary based on the type of information and purpose of processing.
              </p>
              <p>
                You can request deletion of your account and associated data by contacting us,
                subject to legal requirements and ongoing business needs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform.
                Cookies help us remember your preferences, analyze platform usage, and provide personalized content.
              </p>
              <p>
                You can control cookies through your browser settings, but disabling cookies may affect the functionality of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
              <p>
                We may use third-party services for analytics, payment processing, and other business functions.
                These third parties may collect information on our behalf, subject to their own privacy policies.
              </p>
              <p>
                We encourage you to review the privacy policies of these third parties to understand how your information is processed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
              <p>
                Our services are not directed to children under the age of 18. We do not knowingly collect personal information from children under 18.
              </p>
              <p>
                If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. International Transfer</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence.
                These countries may have different data protection laws than those in your jurisdiction.
              </p>
              <p>
                When transferring your information internationally, we implement appropriate safeguards to protect your privacy rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at privacy@adaze.com.
              </p>
              <p className="text-muted-foreground mt-2">
                We&apos;re committed to protecting your data and ensuring transparency in how we handle your information.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}