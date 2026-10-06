// Guest reviews. The master prompt allows ONLY genuine reviews (max three on the home page), each with
// platform, customer name and date. Replace the samples below with real ones and set verified: true.
// While any entry is unverified, the site shows a visible SAMPLE tag, so placeholder text can never pass as real.
export type Review = { quote: string; name: string; source: string; date: string; verified: boolean }

export const REVIEWS: Review[] = [
  { quote: 'Everyone at the table found something they loved, even the fussy eaters.', name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
  { quote: 'Relaxed table service, and the whole feast arrived hot and generous.', name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
  { quote: 'So easy to book, and the children’s Little Table went down a treat.', name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
]
