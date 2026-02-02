import './BookCard.css'

function BookCard({ book }) {
  return (
    <article className="book-card">
      <div className="book-cover">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={`Omslag för ${book.title}`} />
        ) : (
          <div className="book-cover-placeholder">
            <span>{book.title}</span>
          </div>
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-meta">
          {book.year} &middot; {book.publisher}
        </p>
        <p className="book-authors">Med {book.coAuthor}</p>
        <p className="book-description">{book.description}</p>
        {book.buyUrl && (
          <a
            href={book.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="book-buy-link"
          >
            Köp boken
          </a>
        )}
      </div>
    </article>
  )
}

export default BookCard
