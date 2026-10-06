// Guest reviews. The master prompt allows ONLY genuine reviews (max three on the home page), each with
// platform, customer name and date. Replace the samples below with real ones and set verified: true.
// While any entry is unverified, the site shows a visible SAMPLE tag, so placeholder text can never pass as real.
export type Review = { quote: string; rating: 1 | 2 | 3 | 4 | 5; name: string; source: string; date: string; verified: boolean }

export const REVIEWS: Review[] = [
  { quote: 'Booked on a Friday with the kids and everything was easy. The Signature Table was generous, the staff were lovely and nobody left hungry.', rating: 5, name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
  { quote: 'A proper curry night. Hot food, relaxed service and a menu that made choosing simple. The butter chicken was the star of our table.', rating: 5, name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
  { quote: 'Lovely family evening. The Little Table was perfect for our two and we liked knowing the price before we sat down. Back soon for takeaway.', rating: 4, name: 'Sample guest', source: 'Platform name', date: 'Month 2026', verified: false },
]
