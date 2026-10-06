// Guest reviews. The master prompt allows ONLY genuine reviews (max three on the home page), each with
// platform, customer name and date. Replace the samples below with real ones and set verified: true.
// While any entry is unverified, the site shows a visible SAMPLE tag, so placeholder text can never pass as real.
export type Review = { quote: string; rating: 1 | 2 | 3 | 4 | 5; name: string; source: string; date: string; verified: boolean }

export const REVIEWS: Review[] = [
  { quote: "Sample review text goes here. Replace this with a real guest's own words once a verified review has been added.", rating: 5, name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
  { quote: "Sample review text goes here too. This placeholder shows how a longer guest review will type out on the page.", rating: 5, name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
  { quote: "Sample review text for the third card. Verified reviews with platform, name and date will replace all three.", rating: 4, name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
]
