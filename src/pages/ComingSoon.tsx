import { BookBtn, OrderBtn, PageHero } from '../components/ui'
import { SITE } from '../config'
import { track } from '../lib/analytics'
import { useSEO } from '../lib/seo'

// Temporary stand-in for pages hidden while the client finalises packages/pricing.
// Routed from App.tsx — swap the route's element back to the real page to re-enable it.
export default function ComingSoon() {
  useSEO('Coming Soon', 'This page is being finished. Book a table or order takeaway from The Indian Table in Higher Walton, Preston in the meantime.')
  return (
    <PageHero eyebrow="Coming soon" title="This page is on its way" copy="We're putting the finishing touches on this part of the site. In the meantime, you can book a table, order takeaway directly, or give us a call.">
      <BookBtn light from="coming-soon" />
      <OrderBtn light from="coming-soon" />
      <a href={SITE.phoneHref} className="btn-outline-light" onClick={() => track('phone_click', { from: 'coming-soon' })}>Call {SITE.phone}</a>
    </PageHero>
  )
}
