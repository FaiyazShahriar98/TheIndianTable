import { PHOTOS } from '../config'

// Only approved names and prices from the specification are included.
// Dish descriptions, other prices and allergens are intentionally blank until approved menu data is supplied.
export type Tier = {
  id: string; name: string; price: string; tag: string; featured?: boolean; points: string[]
}

export const TIERS: Tier[] = [
  {
    id: 'classic', name: 'Classic Table', price: '£14.95', tag: 'The Familiar Favourites',
    points: ['Classic Starter and Classic Curry', 'Chicken or Mixed Vegetables', 'Boiled Basmati Rice, Pilau Rice or Chips', 'Plain Naan or Chapati, plus a Classic Dessert'],
  },
  {
    id: 'signature', name: 'Signature Table', price: '£18.95', tag: 'More Choice. More Distinctive Flavour.', featured: true,
    points: ['Classic or Signature Starter', 'Classic or Signature Main, including Biryani and Chicken Shashlik', 'Chicken, Chicken Tikka, Lamb, Paneer or Mixed Vegetables', 'Any Signature Rice or Chips, Signature Bread and any Dessert'],
  },
  {
    id: 'grand', name: 'Grand Table', price: '£25.95', tag: 'Premium Grills and Seafood',
    points: ['Everything in Signature, plus Grand selections', 'Premium Grills, Biryani, King Prawn dishes, Lamb Chops and Mixed Tandoori selections', 'Any Rice or Chips, any Bread and any Dessert'],
  },
]

export const JOURNEY = ['Starter', 'Main', 'Rice or Chips', 'Bread', 'Dessert']

export type Dish = { id: string; name: string; cat: string; price?: number; img?: keyof typeof PHOTOS; badge?: string }

export const CATEGORIES = [
  'Complete Meals and Boxes', 'Naan Rolls', 'Street Food and Loaded Fries', 'House Signatures',
  'Regional Chef Specials', 'Familiar Curries', 'Tandoor', 'Biryani', 'Rice and Breads',
  'Sides and Extras', 'Little Table and English Favourites', 'Desserts', 'Drinks',
]

export const SIGNATURES: Dish[] = [
  { id: 'butter', name: 'The Indian Table Butter Chicken', cat: 'House Signatures', img: 'spread' },
  { id: 'rajasthani', name: 'Rajasthani Chicken', cat: 'House Signatures', img: 'tikka' },
  { id: 'srilankan', name: 'Sri Lankan Mango', cat: 'House Signatures', img: 'curry' },
  { id: 'garlic', name: 'Garlic Chilli', cat: 'House Signatures', img: 'biryani' },
  { id: 'shashlik', name: 'Chicken Shashlik', cat: 'House Signatures', img: 'biryani' },
  { id: 'naga', name: 'Chicken Naga', cat: 'House Signatures', img: 'curry' },
  { id: 'makhani', name: 'Paneer Makhani', cat: 'House Signatures', img: 'butter' },
  { id: 'balti', name: 'Balti Minzira', cat: 'House Signatures', img: 'curry' },
  { id: 'railway', name: 'Railway Lamb Curry', cat: 'House Signatures', img: 'tikka' },
  { id: 'shaheen', name: 'Lamb Shaheen', cat: 'House Signatures', img: 'tikka' },
]
export const GRAND: Dish[] = [
  { id: 'prawn', name: 'King Prawn Bangla', cat: 'Grand Dishes', img: 'butter' },
  { id: 'mixedgrill', name: 'Tandoori Mixed Grill', cat: 'Grand Dishes', img: 'paneer' },
]

export const COOLERS = ['Classic Mint Cooler', 'Strawberry Breeze', 'Passion Fruit Crush', 'Mango Madness']
export const DRINK_GROUPS = ['Cooler Pitchers', 'Lassi and Any Lassi Jug', 'Milkshakes', '0.0% Lagers', 'Hot Drinks', 'Bottled Soft Drinks']

export const ORDER_DISHES: Dish[] = [
  { id: 'ffb', name: 'Complete Meal Choices', cat: 'Complete Meals and Boxes', price: 9.95, img: 'paneer', badge: 'Direct-order exclusive' },
  { id: 'lt', name: 'Little Table', cat: 'Little Table and English Favourites', price: 9.95, img: 'tikka' },
  ...SIGNATURES.map(d => ({ ...d })),
  ...GRAND.map(d => ({ ...d, cat: 'Tandoor' })),
  ...COOLERS.map((n, i) => ({ id: `c${i}`, name: n, cat: 'Drinks', price: 4.95, img: 'drink' as const })),
]

export const PRICES = { classic: 14.95, signature: 18.95, grand: 25.95, little: 9.95, family: 59.95 } as const
export type TableChoice = '' | 'classic' | 'signature' | 'grand' | 'family' | 'alacarte'
const gbp = (n: number) => `£${n.toFixed(2)}`
export const TABLE_CHOICES: { id: TableChoice; label: string; sub: string }[] = [
  { id: '', label: 'Not sure yet', sub: 'Decide at the restaurant' },
  { id: 'classic', label: 'Classic Table', sub: `${gbp(PRICES.classic)} per person` },
  { id: 'signature', label: 'Signature Table', sub: `${gbp(PRICES.signature)} per person` },
  { id: 'grand', label: 'Grand Table', sub: `${gbp(PRICES.grand)} per person` },
  { id: 'family', label: 'Family Table', sub: `${gbp(PRICES.family)} for 2 adults and 2 children` },
  { id: 'alacarte', label: 'À la carte', sub: 'Order from the full menu' },
]
