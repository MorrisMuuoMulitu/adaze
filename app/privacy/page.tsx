'use client'

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Shield, Lock, Eye, Database, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/auth-modal';

export default function PrivacyPolicyPage() {
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onAuthClick={setAuthModal} />
      
      <main className="flex-grow py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100 m-0">
                  At ADAZE, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
                </p>
              </div>
            </div>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">Information We Collect</h2>
              </div>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                <li><strong>Profile Data:</strong> Profile picture, location, and role (buyer, trader, or transporter)</li>
                <li><strong>Transaction Data:</strong> Order history, payment information (securely processed through M-Pesa, Stripe, or PayPal)</li>
                <li><strong>Product Listings:</strong> For traders - product photos, descriptions, and pricing</li>
                <li><strong>Communications:</strong> Messages, reviews, and support inquiries</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">How We Use Your Information</h2>
              </div>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and improve our marketplace services</li>
                <li>Process transactions and send order confirmations</li>
                <li>Communicate with you about your account and orders</li>
                <li>Personalize your experience and show relevant products</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">Data Security</h2>
              </div>
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using SSL/TLS</li>
                <li><strong>Secure Authentication:</strong> Password hashing and secure session management</li>
                <li><strong>Payment Security:</strong> We never store full payment card details</li>
                <li><strong>Access Controls:</strong> Role-based permissions limit data access</li>
                <li><strong>Regular Audits:</strong> We conduct security assessments regularly</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold m-0">Information Sharing</h2>
              </div>
              <p>We only share your information in these limited circumstances:</p>
              <ul>
                <li><strong>With Other Users:</strong> Your public profile information is visible to facilitate transactions</li>
                <li><strong>Service Providers:</strong> Payment processors, hosting services, and analytics providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
              <p><strong>We never sell your personal information to third parties.</strong></p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Export your data in a portable format</li>
              </ul>
              <p>To exercise these rights, contact us at <a href="mailto:privacy@adaze.co.ke">privacy@adaze.co.ke</a></p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and user behavior</li>
                <li>Personalize content and advertisements</li>
              </ul>
              <p>You can control cookies through your browser settings.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p>ADAZE is not intended for users under 18 years of age. We do not knowingly collect information from children under 18.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or platform notification.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p>If you have questions about this privacy policy, please contact us:</p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:privacy@adaze.co.ke">privacy@adaze.co.ke</a></li>
                <li><strong>Phone:</strong> +254 700 123 456</li>
                <li><strong>Address:</strong> Nairobi, Kenya</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <AuthModal 
        type={authModal} 
        isOpen={!!authModal} 
        onClose={() => setAuthModal(null)}
        onSuccess={() => setAuthModal(null)}
      />
    </div>
  );
}
