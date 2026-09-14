import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete Your Account — SabaiB',
  description: 'How to delete your SabaiB account and what data is removed.',
}

export default function AccountDeletionPage() {
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
          Deleting your SabaiB account
        </h1>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-sabai-charcoal">
          <section>
            <p>
              You can delete your account and all associated data directly within the SabaiB app:
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>Open SabaiB and sign in</li>
              <li>Go to Settings</li>
              <li>Tap &ldquo;Delete Account&rdquo;</li>
              <li>Confirm deletion</li>
            </ol>
            <p className="mt-4">
              Your account will be permanently deleted immediately upon confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sabai-navy">What gets deleted</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Your account credentials and profile information</li>
              <li>
                All bills you created and hosted, including items, charges, and participant
                records within those bills
              </li>
              <li>Your guest participation history in other users&apos; bills</li>
              <li>Uploaded receipt images and OCR-extracted data</li>
            </ul>
          </section>

          <section>
            <p className="rounded-r-lg border-l-4 border-sabai-yellow-dark bg-sabai-yellow-light/30 p-4">
              <strong>Note:</strong> If you are hosting a bill that is still being split, deleting
              your account will remove that bill entirely for all participants.
            </p>
          </section>

          <section>
            <p>
              If you&apos;re unable to access the app, you may also request deletion by emailing{' '}
              <a href="mailto:support@shwan.me?subject=Account%20Deletion%20Request" className="font-semibold text-sabai-navy underline">
                support@shwan.me
              </a>{' '}
              with subject &ldquo;Account Deletion Request.&rdquo;
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
