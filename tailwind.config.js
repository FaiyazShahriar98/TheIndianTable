/** Design tokens. Every colour has ONE job; spacing is the 8pt grid (see scripts/lint-grid.mjs).
 *  page      cream canvas                       sunken     alternate section band / quiet fills
 *  brand     deep emerald: dark surfaces, headings, primary button
 *  brand-hover / brand-deep   hover state and text on gold
 *  ink       body copy on page                  gold       lines, icons, emphasis ON DARK only (never small text on cream)
 *  gold-text AA-safe brass for small labels on cream
 *  line / line-strong  hairlines and control borders   danger / success   form + status only   mark  highlighted note
 */
const c = n => `rgb(var(--${n}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent', current: 'currentColor', white: '#ffffff',
      page: c('page'), sunken: c('sunken'), brand: c('brand'), 'brand-hover': c('brand-hover'), 'brand-deep': c('brand-deep'),
      ink: c('ink'), gold: c('gold'), 'gold-hover': c('gold-hover'), 'gold-text': c('gold-text'),
      line: 'rgb(var(--brand) / 0.2)', 'line-strong': 'rgb(var(--brand) / 0.4)', danger: c('danger'), success: c('success'), mark: c('mark'),
    },
    // Type scale: nine steps, nothing else.
    fontSize: {
      micro: ['0.75rem', { lineHeight: '1rem' }],
      small: ['0.875rem', { lineHeight: '1.25rem' }],
      body: ['1rem', { lineHeight: '1.5rem' }],
      bodylg: ['1.0625rem', { lineHeight: '1.75rem' }],
      lead: ['1.25rem', { lineHeight: '1.75rem' }],
      title: ['1.75rem', { lineHeight: '2rem' }],
      head: ['2rem', { lineHeight: '2.25rem' }],
      big: ['2.75rem', { lineHeight: '2.75rem' }],
      price: ['3.5rem', { lineHeight: '3.5rem' }],
      hero: ['4.5rem', { lineHeight: '4.25rem' }],
    },
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '1200px' },
      borderRadius: { card: '18px', btn: '12px' },
    },
  },
  plugins: [],
}
