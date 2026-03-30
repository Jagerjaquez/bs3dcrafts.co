'use client'

/**
 * Test Mode Banner Component
 * 
 * Displays a prominent banner when the application is running in Stripe test mode.
 * This helps developers and testers identify that they are not processing real payments.
 * 
 * The banner is only shown when:
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starts with 'pk_test_'
 * 
 * Usage:
 * - Add to checkout page: <TestModeBanner />
 * - Add to success page: <TestModeBanner />
 */

// Check at build time if we're in test mode
const isTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') ?? false

export function TestModeBanner() {
  // Don't render anything if not in test mode
  if (!isTestMode) {
    return null
  }

  return (
    <div className="bg-yellow-500 text-black px-4 py-3 text-center font-semibold shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>TEST MODE</span>
        <span className="hidden sm:inline">- Gerçek ödemeler işlenmeyecek</span>
      </div>
    </div>
  )
}

/**
 * Compact Test Mode Badge
 * 
 * A smaller badge variant that can be placed inline with other content.
 * Useful for forms or smaller UI sections.
 */
export function TestModeBadge() {
  // Don't render anything if not in test mode
  if (!isTestMode) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-yellow-500 text-black rounded">
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      TEST MODE
    </span>
  )
}
