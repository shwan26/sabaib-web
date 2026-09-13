import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — SabaiB',
  description: 'The terms that govern your use of SabaiB.',
}

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-sabai-gray">Effective date: September 13, 2026</p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-sabai-charcoal">
          <section>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of SabaiB
              (&ldquo;SabaiB&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a bill-splitting and
              tracking service. By creating an account or using the Service, you agree to these
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">1. Description of Service</h2>
            <p className="mt-3">
              SabaiB lets you create bills, add items and prices, invite others to a bill or
              group using a join code, and split costs between participants. SabaiB is a tool for
              tracking and splitting amounts — it does not move money between users (see
              &ldquo;Payments&rdquo; below).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">2. Accounts</h2>
            <p className="mt-3">
              You must provide accurate information when creating an account and are responsible
              for keeping your login credentials secure. You&apos;re responsible for all activity
              that happens under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">3. Bills, Groups &amp; Shared Content</h2>
            <p className="mt-3">
              Anyone with a bill&apos;s join code can view and, depending on the bill, edit the
              items and totals in that bill. You are responsible for the accuracy of the bill
              information you enter and for who you share a join code with. SabaiB is not
              responsible for disputes between group members about a bill&apos;s contents or who
              owes what.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">4. Payments</h2>
            <p className="mt-3">
              SabaiB may display payment details (such as a PromptPay QR code) to help you settle
              a bill, but SabaiB is <strong>not</strong> a payment processor, money transmitter,
              or party to any payment. Any money owed is settled directly between users, outside
              the Service, and at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">5. Acceptable Use</h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Use the Service for any unlawful purpose or to defraud another person.</li>
              <li>Attempt to gain unauthorized access to another user&apos;s account or data.</li>
              <li>Interfere with or disrupt the Service&apos;s operation.</li>
              <li>Use join codes to access bills or groups you were not invited to.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">6. Intellectual Property</h2>
            <p className="mt-3">
              The Service, including its design, branding, and code, is owned by SabaiB and
              protected by applicable intellectual property laws. You retain ownership of the
              bill and group content you create; you grant us a license to store and display it
              in order to operate the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">7. Disclaimers</h2>
            <p className="mt-3">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
              warranties of any kind, express or implied. We do not guarantee the Service will be
              uninterrupted, error-free, or that bill calculations will be free of user input
              errors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">8. Limitation of Liability</h2>
            <p className="mt-3">
              To the fullest extent permitted by law, SabaiB will not be liable for any indirect,
              incidental, or consequential damages, or for any money disputes between users,
              arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">9. Termination</h2>
            <p className="mt-3">
              You may stop using the Service and delete your account at any time. We may suspend
              or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">10. Changes to These Terms</h2>
            <p className="mt-3">
              We may update these Terms from time to time. If we make material changes, we will
              update the effective date above. Continued use of the Service after changes means
              you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">11. Governing Law</h2>
            <p className="mt-3">
              These Terms are governed by the laws applicable in the jurisdiction where SabaiB
              operates, without regard to conflict-of-law principles, except where local law
              requires otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">12. Contact Us</h2>
            <p className="mt-3">
              Questions about these Terms? Email us at{' '}
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
