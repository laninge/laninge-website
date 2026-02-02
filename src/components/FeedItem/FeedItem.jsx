import './FeedItem.css'

function FeedItem({ item }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <article className="feed-item">
      <span className="feed-item-type">{item.type}</span>
      <h3 className="feed-item-title">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>
      {item.description && (
        <p className="feed-item-description">{item.description}</p>
      )}
      <time className="feed-item-date" dateTime={item.date}>
        {formatDate(item.date)}
      </time>
    </article>
  )
}

export default FeedItem
