import { useEffect } from 'react'

export function useSEO(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | The Indian Table`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = `https://www.theindiantablepreston.co.uk${location.pathname === '/' ? '' : location.pathname}`
  }, [title, description])
}
