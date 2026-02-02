import './Contact.css'

function Contact() {
  return (
    <div className="contact">
      <h1>Kontakt</h1>

      <section className="contact-section">
        <h2>Allmänna förfrågningar</h2>
        <p>
          För frågor om föreläsningar, samarbeten eller annat, kontakta mig via e-post.
        </p>
        <a href="mailto:niklas@laninge.com" className="contact-link">
          niklas@laninge.com
        </a>
      </section>

      <section className="contact-section">
        <h2>Press och media</h2>
        <p>
          Journalister och redaktioner är välkomna att höra av sig för intervjuer
          och expertkommentarer inom beteendeekonomi och konsumentpsykologi.
        </p>
        <a href="mailto:niklas@laninge.com" className="contact-link">
          niklas@laninge.com
        </a>
      </section>

      <section className="contact-section">
        <h2>Sociala medier</h2>
        <div className="social-links">
          <a
            href="https://www.linkedin.com/in/niklaslaning/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://niklaslaning.substack.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Substack
          </a>
        </div>
      </section>
    </div>
  )
}

export default Contact
