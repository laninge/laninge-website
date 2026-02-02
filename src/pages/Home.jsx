import Hero from '../components/Hero/Hero'
import NewsletterCTA from '../components/NewsletterCTA/NewsletterCTA'
import FeedItem from '../components/FeedItem/FeedItem'
import { useFeed } from '../hooks/useFeed'
import './Home.css'

function Home() {
  const { items, loading, error } = useFeed()
  const latestItems = items.slice(0, 3)

  return (
    <div className="home">
      <Hero />

      <NewsletterCTA />

      <section className="home-feed">
        <h2>Senaste</h2>
        {loading && <p className="feed-loading">Laddar...</p>}
        {error && <p className="feed-error">Kunde inte ladda flödet</p>}
        {!loading && !error && latestItems.length === 0 && (
          <p className="feed-empty">Inga inlägg än</p>
        )}
        <div className="feed-list">
          {latestItems.map((item) => (
            <FeedItem key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
