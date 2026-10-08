import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { Motion } from './lib/motion'
import Home from './pages/Home'
import ComingSoon from './pages/ComingSoon'

// Route-level code splitting keeps the first load small.
const Book = lazy(() => import('./pages/Book'))
const Order = lazy(() => import('./pages/Order'))
const Menus = () => import('./pages/Menus')
const Info = () => import('./pages/Info')
const FixedPrice = lazy(() => Menus().then(m => ({ default: m.FixedPrice })))
const ALaCarte = lazy(() => Menus().then(m => ({ default: m.ALaCarte })))
const Drinks = lazy(() => Menus().then(m => ({ default: m.Drinks })))
const BringToCar = lazy(() => Info().then(m => ({ default: m.BringToCar })))
const Family = lazy(() => Info().then(m => ({ default: m.Family })))
const OurStory = lazy(() => Info().then(m => ({ default: m.OurStory })))
const Contact = lazy(() => Info().then(m => ({ default: m.Contact })))
const Allergens = lazy(() => Info().then(m => ({ default: m.Allergens })))
const Privacy = lazy(() => Info().then(m => ({ default: m.Privacy })))
const Cookies = lazy(() => Info().then(m => ({ default: m.Cookies })))
const Terms = lazy(() => Info().then(m => ({ default: m.Terms })))
const NotFound = lazy(() => Info().then(m => ({ default: m.NotFound })))

export default function App() {
  return (
    <Motion>
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {/* Packages/menus hidden at the client's request until pricing is finalised — routes point
                at ComingSoon instead of being deleted, so re-enabling is just swapping the element back. */}
            <Route path="fixed-price-menu" element={<ComingSoon />} />
            <Route path="a-la-carte" element={<ComingSoon />} />
            <Route path="drinks" element={<ComingSoon />} />
            <Route path="order" element={<ComingSoon />} />
            <Route path="bring-to-car" element={<ComingSoon />} />
            <Route path="family" element={<ComingSoon />} />
            <Route path="book" element={<Book />} />
            <Route path="our-story" element={<OurStory />} />
            <Route path="contact" element={<Contact />} />
            <Route path="allergens" element={<Allergens />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="cookies" element={<Cookies />} />
            <Route path="terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </Motion>
  )
}
