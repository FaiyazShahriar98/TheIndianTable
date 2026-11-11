// Christmas Day 2026 details, transcribed from the client's 6-page menu set.

export const XMAS = {
  year: 2026,
  times: ['12.30pm', '3.30pm'],
  adult: '£32.95',
  child: '£19.95',
  childAges: '4–9',
  freeUnder: 3,
} as const

export type MenuCourse = {
  label: string
  /** Small qualifier next to the label, e.g. "Choose one starter" */
  note?: string
  /** Bold line, e.g. the dish name */
  title?: string
  intro?: string
  items?: string[]
  text?: string
  footnote?: string
  /** Rendered as a highlighted dish card */
  feature?: boolean
  /** Lay the items out in two columns on wider screens */
  cols?: boolean
}

export type XmasMenu = {
  id: 'christmas' | 'indian' | 'little'
  tab: string
  title: string
  price?: string
  priceNote?: string
  courses: MenuCourse[]
  banner?: string
}

export const XMAS_MENUS: XmasMenu[] = [
  {
    id: 'christmas',
    tab: 'Traditional',
    title: 'The Traditional Christmas Table',
    price: XMAS.adult,
    priceNote: 'per adult',
    courses: [
      { label: 'To begin', note: 'Choose one starter', items: ['Festive Vegetable Soup with Warm Bread', 'Chicken Tikka', 'Vegetable Samosa'] },
      {
        label: 'The main event', title: 'Traditional Roast Turkey', intro: 'Succulent roast turkey served with:',
        items: ['Crispy Roast Potatoes', 'Sage & Onion Stuffing', 'Glazed Carrots and Seasonal Vegetables', 'Cranberry Sauce', 'Rich Roast Gravy'],
        footnote: 'Optional mild Indian Masala Gravy for an Indian twist.',
      },
      { label: 'A sweet finish', title: 'Christmas Pudding', feature: true },
    ],
  },
  {
    id: 'indian',
    tab: 'Indian',
    title: 'The Indian Christmas Table',
    price: XMAS.adult,
    priceNote: 'per adult',
    courses: [
      { label: 'To begin', title: 'Poppadoms & Chutneys' },
      { label: 'Choose one starter', items: ['Chicken Tikka', 'Tandoori Wings', 'Onion Bhaji', 'Vegetable Samosa'], cols: true },
      {
        label: 'Choose your favourite curry',
        items: ['Butter Chicken', 'Chicken Tikka Masala', 'Rajasthani Chicken', 'Railway Lamb Curry', 'Paneer Makhani', 'Chana Masala'],
        cols: true,
      },
      { label: 'Make it yours', text: 'Choose Boiled Rice, Pilau Rice or Chips, plus Plain Naan, Garlic Naan or Chapati.' },
      { label: 'A sweet finish', title: 'Gulab Jamun with Ice Cream', feature: true },
    ],
    banner: 'Vegetarian options available • Other dishes? Please enquire.',
  },
  {
    id: 'little',
    tab: 'Little',
    title: 'The Little Christmas Table',
    price: XMAS.child,
    priceNote: `ages ${XMAS.childAges}`,
    courses: [
      { label: 'To start', text: 'Choose Poppadoms & Chutney, Chicken Tikka Bites or Vegetable Samosa.' },
      {
        label: 'Choose your main',
        items: [
          'Mini Christmas Turkey Roast with Potatoes, Vegetables and Gravy',
          'Chicken Korma, Butter Chicken or Tikka Masala with Rice and Mini Naan',
          'Chicken Nuggets with Chips',
        ],
      },
      { label: 'Dessert', text: 'Vanilla Ice Cream with Sauce.' },
      { label: 'Also included', text: 'One children’s juice or water.' },
    ],
    banner: 'Ages 3 and under eat free',
  },
]

export const XMAS_EXTRAS = [
  { title: 'Crafts', text: 'A little creativity for children' },
  { title: 'Live entertainment', text: 'Something to enjoy together' },
  { title: 'Christmas crackers', text: 'A classic moment at the table' },
  { title: 'Gifts for kids', text: 'A small festive surprise' },
] as const
