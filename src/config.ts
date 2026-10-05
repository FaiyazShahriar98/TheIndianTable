export const SITE = {
  name: 'The Indian Table',
  address: '350 Higher Walton Road, Preston, PR5 4HU',
  phone: '01772 381 429',
  phoneHref: 'tel:+441772381429',
  website: 'www.theindiantablepreston.co.uk',
  // Replace when the live providers / verified accounts are confirmed.
  ORDER_URL: '',
  MAP_URL: 'https://www.google.com/maps/search/?api=1&query=350+Higher+Walton+Road+Preston+PR5+4HU',
  INSTAGRAM_URL: '',
  hours: [
    { days: 'Monday to Thursday', open: '5pm', close: '10.30pm' },
    { days: 'Friday', open: '5pm', close: '11pm' },
    { days: 'Saturday', open: '4pm', close: '11pm' },
    { days: 'Sunday', open: '4pm', close: '10.30pm' },
  ],
  // [openHour, closeHour] decimal, indexed by JS getDay() (0 = Sunday)
  hoursByDay: [[16, 22.5], [17, 22.5], [17, 22.5], [17, 22.5], [17, 22.5], [17, 23], [16, 23]] as [number, number][],
}

export const img = (id: string, w = 800, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`

// Placeholder Unsplash photography. Swap for real restaurant photography before launch.
export const PHOTOS = {
  hero: '1585937421612-70a008356fbe',
  tikka: '1565557623262-b51c2513a641',
  butter: '1631452180519-c014fe946bc7',
  naan: '1589302168068-964664d93dc0',
  biryani: '1567188040759-fb8a883dc6d8',
  curry: '1596797038530-2c107229654b',
  tandoori: '1601050690597-df0568f70950',
  paneer: '1617692855027-33b14f061079',
  spread: '1603894584373-5ac82b2ae398',
  interior: '1555396273-367ea4eb4db5',
  dining: '1414235077428-338989a2e8c0',
  room: '1517248135467-4c7edcad34c4',
  table: '1559339352-11d035aa65de',
  drink: '1546833999-b9f581a1996d',
  dessert: '1606491956689-2ea866880c84',
  street: '1574653853027-5382a3d23a15',
}

export function openStatus(now = new Date()) {
  const [o, c] = SITE.hoursByDay[now.getDay()]
  const h = now.getHours() + now.getMinutes() / 60
  return h >= o && h < c
}
