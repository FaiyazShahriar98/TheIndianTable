import { AnimatePresence, LazyMotion, domAnimation, m, useInView, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

export const Motion = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
)
export { AnimatePresence, m, useInView, useReducedMotion }

const ease = [0.22, 1, 0.36, 1] as const
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
}
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const vp = { once: true, margin: '0px 0px -10% 0px' }

/** Scroll-triggered reveal. Transform and opacity only (GPU friendly), runs once. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <m.div className={className} variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} transition={{ delay }}>
      {children}
    </m.div>
  )
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <m.div className={className} variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
      {children}
    </m.div>
  )
}

export const Item = ({ children, className }: { children: ReactNode; className?: string }) => {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return <m.div className={className} variants={fadeUp}>{children}</m.div>
}
