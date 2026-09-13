import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — SabaiB',
  description: 'How SabaiB collects, uses, and protects your information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-sabai-navy hover:text-sabai-yellow-dark"
        >
          ← Back to SabaiB
        </Link>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-sabai-navy">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-sabai-gray">Effective date: September 13, 2026</p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-sabai-charcoal">
          <section>
            <p>
              SabaiB (&ldquo;SabaiB&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) helps you split and
              track bills with friends. This Privacy Policy explains what information we collect,
              how we use it, and who we share it with when you use our website and app
              (the &ldquo;Service&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">1. Information We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Account information:</strong> when you sign up, we collect your name,
                email address, and password. Authentication and account storage are handled by
                our database provider, Supabase.
              </li>
              <li>
                <strong>Bill and group data:</strong> information you enter to create or join a
                bill — such as bill names, items, prices, group members, and the join codes used
                to invite others.
              </li>
              <li>
                <strong>Usage data:</strong> if you accept our cookie banner, we use Google
                Analytics to understand how the Service is used (e.g. pages visited, general
                usage patterns). This only runs after you consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">2. How We Use Information</h2>
            <p className="mt-3">We use the information we collect to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Provide, operate, and maintain the Service, including creating and displaying bills and groups.</li>
              <li>Authenticate you and secure your account.</li>
              <li>Communicate with you about your account (e.g. confirmation emails).</li>
              <li>Understand aggregate usage and improve the Service, where you&apos;ve consented to analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">3. How We Share Information</h2>
            <p className="mt-3">
              We do not sell your personal information. We share information only in the
              following ways:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>With other members of your bill or group:</strong> anyone who joins a
                bill using a shared join code can see the bill&apos;s items, prices, and the
                names of people in that group. Only share a join code with people you trust.
              </li>
              <li>
                <strong>With service providers:</strong> we use Supabase to host our database and
                handle authentication, and Google Analytics for usage analytics. These providers
                process data on our behalf and are bound to protect it.
              </li>
              <li>
                <strong>For legal reasons:</strong> if required to comply with applicable law,
                regulation, or legal process.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">4. Cookies &amp; Analytics</h2>
            <p className="mt-3">
              We use a cookie-consent banner to ask for your permission before loading analytics
              cookies. You can decline analytics cookies and continue using the Service; this
              only limits our ability to measure usage, not core functionality like creating or
              joining bills.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">5. Data Retention &amp; Security</h2>
            <p className="mt-3">
              We retain account and bill data for as long as your account is active or as needed
              to provide the Service. We use industry-standard measures (such as encrypted
              connections and access controls provided by Supabase) to help protect your
              information, though no method of transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">6. Your Rights &amp; Choices</h2>
            <p className="mt-3">
              You can update your account information at any time. To request access to, or
              deletion of, your personal data, contact us at the email below and we will respond
              as required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">7. Children&apos;s Privacy</h2>
            <p className="mt-3">
              The Service is not directed to children under 13, and we do not knowingly collect
              personal information from children under 13. If you believe a child has provided us
              information, please contact us so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">8. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. If we make material changes,
              we will update the effective date above. Continued use of the Service after changes
              means you accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">9. Contact Us</h2>
            <p className="mt-3">
              Questions about this Privacy Policy? Email us at{' '}
              <a href="mailto:support@shwan.me" className="font-semibold text-sabai-navy underline">
                support@shwan.me
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
