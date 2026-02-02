import FeedItem from '../components/FeedItem/FeedItem'
import { useFeed } from '../hooks/useFeed'
import './Feed.css'

function Feed() {
  const { items, loading, error } = useFeed()

  return (
    <div className="feed">
      <h1>Aktuellt</h1>
      <p className="feed-intro">
        Senaste artiklarna, podcast-medverkan och medieklipp.
      </p>

      {loading && <p className="feed-status">Laddar...</p>}
      {error && <p className="feed-status">Kunde inte ladda flödet</p>}
      {!loading && !error && items.length === 0 && (
        <p className="feed-status">Inga inlägg än</p>
      )}

      <div className="feed-list">
        {items.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default Feed
