import './App.css'

function App() {
  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">Psykolog & författare</p>
          <h1 className="hero-title">Niklas Laninge</h1>
          <p className="hero-subtitle">
            Jag hjälper människor förstå varför vi fattar de beslut vi gör.
            Som sparpsykolog på Opti gör jag beteendeekonomi till praktiska verktyg för ett bättre sparande.
          </p>
          <div className="hero-cta">
            <a href="https://laninge.substack.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Prenumerera på nyhetsbrevet
            </a>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scrolla</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* About Section */}
      <section className="section section-about">
        <div className="section-content">
          <h2 className="section-label">Om mig</h2>
          <p className="section-text-large">
            Expert inom beteendeekonomi och konsumentpsykologi.
            Regelbundet i TV4, P1, DN, DI och Omni.
          </p>
          <div className="about-details">
            <div className="about-card">
              <span className="about-icon">📚</span>
              <h3>Författare</h3>
              <p>Tre böcker om beteendeekonomi tillsammans med Arvid Janson. Fjärde boken på gång.</p>
            </div>
            <div className="about-card">
              <span className="about-icon">💰</span>
              <h3>Sparpsykolog</h3>
              <p>PR-ansvarig och sparpsykolog på Opti, svensk fintech som hjälper människor spara smartare.</p>
            </div>
            <div className="about-card">
              <span className="about-icon">🎤</span>
              <h3>Mediaexpert</h3>
              <p>Omvandlar komplexa beteendeinsikter till begripliga mediemoment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Media Section - Dynamic Feed */}
      <section className="section section-media">
        <div className="section-content">
          <h2 className="section-label">Läs & lyssna</h2>
          <p className="section-intro">Senaste artiklarna, poddar och medieklipp</p>

          <div className="media-grid">
            <a href="https://laninge.substack.com" target="_blank" rel="noopener noreferrer" className="media-card media-card-featured">
              <span className="media-type">Nyhetsbrev</span>
              <h3>Substack</h3>
              <p>Insikter om beteendeekonomi, konsumentpsykologi och sparande.</p>
              <span className="media-arrow">→</span>
            </a>

            <a href="https://omniekonomi.se/t/folj-skribenten-niklas-laninge/e51a66da-c58c-4eca-88ba-1f57a3ba365d" target="_blank" rel="noopener noreferrer" className="media-card">
              <span className="media-type">Krönika</span>
              <h3>Omni Ekonomi</h3>
              <p>Regelbundna krönikor om ekonomiskt beteende och konsumtion.</p>
              <span className="media-arrow">→</span>
            </a>

            <a href="https://open.spotify.com/show/6x65WFaPmYlHLB19ECjh77" target="_blank" rel="noopener noreferrer" className="media-card">
              <span className="media-type">Podcast</span>
              <h3>Tidlösa sanningar om pengar</h3>
              <p>Podd om sparande och privatekonomi – med beteendevetenskapliga glasögon.</p>
              <span className="media-arrow">→</span>
            </a>
          </div>

          <p className="media-note">
            Mer innehåll läggs till automatiskt här framöver.
          </p>
        </div>
      </section>

      {/* Books Section */}
      <section className="section section-books">
        <div className="section-content">
          <h2 className="section-label">Böcker</h2>
          <p className="section-intro">Tre böcker om beteendedesign, tillsammans med Arvid Janson</p>

          <div className="books-grid">
            <div className="book-card">
              <div className="book-year">2017</div>
              <h3>Beteendedesign</h3>
              <p className="book-publisher">Natur & Kultur</p>
              <p>En praktisk guide till hur du kan använda beteendeekonomi för att designa bättre produkter och tjänster.</p>
              <a href="https://www.adlibris.com/se/bok/beteendedesign-9789127819191" target="_blank" rel="noopener noreferrer" className="book-link">
                Köp boken →
              </a>
            </div>

            <div className="book-card">
              <div className="book-year">2018</div>
              <h3>Beslutsfällan</h3>
              <p className="book-publisher">Volante</p>
              <p>Varför fattar vi dåliga beslut – och hur kan vi bli bättre? Om de psykologiska fällor som styr våra val.</p>
              <a href="https://www.adlibris.com/se/bok/beslutfallan-9789188659583" target="_blank" rel="noopener noreferrer" className="book-link">
                Köp boken →
              </a>
            </div>

            <div className="book-card">
              <div className="book-year">2019</div>
              <h3>Digitala beteenden</h3>
              <p className="book-publisher">Natur & Kultur</p>
              <p>Hur påverkar den digitala världen oss? Om skärmtid, sociala medier och en sundare relation till teknik.</p>
              <a href="https://www.adlibris.com/se/bok/digitala-beteenden-9789127824454" target="_blank" rel="noopener noreferrer" className="book-link">
                Köp boken →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section section-contact">
        <div className="section-content">
          <h2 className="section-label">Kontakt</h2>
          <p className="section-text-large">
            Vill du boka mig för en föreläsning, intervju eller kommentar? Hör av dig.
          </p>
          <div className="contact-links">
            <a href="mailto:niklas@laninge.com" className="contact-link">
              <span className="contact-icon">✉️</span>
              niklas@laninge.com
            </a>
            <a href="https://www.linkedin.com/in/laninge/" target="_blank" rel="noopener noreferrer" className="contact-link">
              <span className="contact-icon">💼</span>
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Niklas Laninge</p>
      </footer>
    </div>
  )
}

export default App
