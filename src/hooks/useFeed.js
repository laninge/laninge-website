import { useState, useEffect } from 'react'

const SUBSTACK_FEED_URL = 'https://niklaslaning.substack.com/feed'
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

export function useFeed() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchFeed() {
      try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(SUBSTACK_FEED_URL))

        if (!response.ok) {
          throw new Error('Failed to fetch feed')
        }

        const text = await response.text()
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')

        const rssItems = xml.querySelectorAll('item')
        const feedItems = Array.from(rssItems).map((item, index) => ({
          id: index,
          type: 'Substack',
          title: item.querySelector('title')?.textContent || '',
          description: stripHtml(item.querySelector('description')?.textContent || '').slice(0, 200) + '...',
          url: item.querySelector('link')?.textContent || '',
          date: item.querySelector('pubDate')?.textContent || new Date().toISOString()
        }))

        setItems(feedItems)
      } catch (err) {
        setError(err.message)
        // Return fallback data if feed fails
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [])

  return { items, loading, error }
}

function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}
