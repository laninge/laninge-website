import './NewsletterCTA.css'

function NewsletterCTA() {
  return (
    <section className="newsletter-cta">
      <h2>Nyhetsbrev</h2>
      <p>
        Få insikter om beteendeekonomi, konsumentpsykologi och sparande direkt i inkorgen.
      </p>
      <a
        href="https://niklaslaning.substack.com"
        target="_blank"
        rel="noopener noreferrer"
        className="newsletter-button"
      >
        Prenumerera på Substack
      </a>
    </section>
  )
}

export default NewsletterCTA
