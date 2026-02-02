import BookCard from '../components/BookCard/BookCard'
import { books } from '../data/books'
import './Books.css'

function Books() {
  return (
    <div className="books">
      <h1>Böcker</h1>
      <p className="books-intro">
        Alla böcker är skrivna tillsammans med Arvid Janson och handlar om hur
        vi kan använda psykologiska insikter för att förstå och förändra beteenden.
      </p>

      <div className="books-list">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}

export default Books
