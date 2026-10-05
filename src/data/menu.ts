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
    id: 'signature', name: 'Signature Table', price: '£18.95', tag: "Chef's Recommendation: More Choice. More Distinctive Flavour.", featured: true,
    points: ['Classic or Signature Starter', 'Classic or Signature Main, including Biryani and Chicken Shashlik', 'Chicken, Chicken Tikka, Lamb, Paneer or Mixed Vegetables', 'Any Signature Rice or Chips, Signature Bread and any Dessert'],
  },
  {
    id: 'grand', name: 'Grand Table', price: '£25.95', tag: 'Premium Grills and Seafood',
    points: ['Everything in Signature, plus Grand selections', 'Premium Grills, Biryani, King Prawn dishes, Lamb Chops and Mixed Tandoori selections', 'Any Rice or Chips, any Bread and any Dessert'],
  },
]

export const JOURNEY = ['Starter', 'Main', 'Rice or Chips', 'Bread', 'Dessert']

export type Dish = { id: string; name: string; cat: string; price?: number; img?: string; badge?: string }

export const CATEGORIES = [
  'Complete Meals and Boxes', 'Naan Rolls', 'Street Food and Loaded Fries', 'House Signatures',
  'Regional Chef Specials', 'Familiar Curries', 'Tandoor', 'Biryani', 'Rice and Breads',
  'Sides and Extras', 'Little Table and English Favourites', 'Desserts', 'Drinks',
]

export const SIGNATURES: Dish[] = [
  { id: 'butter', name: 'The Indian Table Butter Chicken', cat: 'House Signatures', img: PHOTOS.butter },
  { id: 'rajasthani', name: 'Rajasthani Chicken', cat: 'House Signatures', img: PHOTOS.curry },
  { id: 'srilankan', name: 'Sri Lankan Mango', cat: 'House Signatures', img: PHOTOS.tikka },
  { id: 'garlic', name: 'Garlic Chilli', cat: 'House Signatures', img: PHOTOS.street },
  { id: 'shashlik', name: 'Chicken Shashlik', cat: 'House Signatures', img: PHOTOS.tandoori },
  { id: 'naga', name: 'Chicken Naga', cat: 'House Signatures', img: PHOTOS.curry },
  { id: 'makhani', name: 'Paneer Makhani', cat: 'House Signatures', img: PHOTOS.paneer },
  { id: 'balti', name: 'Balti Minzira', cat: 'House Signatures', img: PHOTOS.spread },
  { id: 'railway', name: 'Railway Lamb Curry', cat: 'House Signatures', img: PHOTOS.curry },
  { id: 'shaheen', name: 'Lamb Shaheen', cat: 'House Signatures', img: PHOTOS.biryani },
]
export const GRAND: Dish[] = [
  { id: 'prawn', name: 'King Prawn Bangla', cat: 'Grand Dishes', img: PHOTOS.tikka },
  { id: 'mixedgrill', name: 'Tandoori Mixed Grill', cat: 'Grand Dishes', img: PHOTOS.tandoori },
]

export const COOLERS = ['Classic Mint Cooler', 'Strawberry Breeze', 'Passion Fruit Crush', 'Mango Madness']
export const DRINK_GROUPS = ['Cooler Pitchers', 'Lassi and Any Lassi Jug', 'Milkshakes', '0.0% Lagers', 'Hot Drinks', 'Bottled Soft Drinks']

export const ORDER_DISHES: Dish[] = [
  { id: 'ffb', name: 'Family Feast Box', cat: 'Complete Meals and Boxes', price: 29.95, img: PHOTOS.spread, badge: 'Direct-order exclusive' },
  { id: 'lt', name: 'Little Table', cat: 'Little Table and English Favourites', price: 9.95, img: PHOTOS.naan },
  ...SIGNATURES.map(d => ({ ...d })),
  ...GRAND.map(d => ({ ...d, cat: 'Tandoor' })),
  ...COOLERS.map((n, i) => ({ id: `c${i}`, name: n, cat: 'Drinks', price: 4.95, img: PHOTOS.drink })),
]
