import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const fallbackNewsletters = [
    { title: 'Niklas Laninges nyhetsbrev #288', link: 'https://laninge.substack.com/p/niklas-laninges-nyhetsbrev-288', date: new Date('2026-03-08') },
    { title: 'Niklas Laninges nyhetsbrev #287', link: 'https://laninge.substack.com/p/niklas-laninges-nyhetsbrev-287', date: new Date('2026-02-22') },
    { title: 'Niklas Laninges nyhetsbrev #286', link: 'https://laninge.substack.com/p/niklas-laninges-nyhetsbrev-286', date: new Date('2026-02-08') },
    { title: 'Niklas Laninge nyhetsbrev #285', link: 'https://laninge.substack.com/p/niklas-laninge-nyhetsbrev-285', date: new Date('2026-01-25') },
    { title: 'Niklas Laninges nyhetsbrev #284', link: 'https://laninge.substack.com/p/niklas-laninges-nyhetsbrev-284', date: new Date('2026-01-11') },
  ]

  const [newsletters, setNewsletters] = useState(fallbackNewsletters)
  const [showTopBar, setShowTopBar] = useState(true)

  useEffect(() => {
    fetch('https://laninge.substack.com/feed')
      .then(res => res.text())
      .then(xml => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(xml, 'text/xml')
        const items = Array.from(doc.querySelectorAll('item')).slice(0, 5).map(item => ({
          title: item.querySelector('title')?.textContent || '',
          link: item.querySelector('link')?.textContent || '',
          date: new Date(item.querySelector('pubDate')?.textContent || ''),
        }))
        if (items.length > 0) setNewsletters(items)
      })
      .catch(() => {})
  }, [])

  const formatDate = (date) => {
    return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className={`app ${showTopBar ? 'has-top-bar' : ''}`}>
      {/* Top Newsletter Bar */}
      {showTopBar && (
        <div className="top-bar">
          <div className="top-bar-inner">
            <p className="top-bar-text">
              <strong>Veckovisa insikter om beteendeförändring.</strong>
            </p>
            <form
              className="top-bar-form"
              action="https://laninge.substack.com/api/v1/free?nojs=true"
              method="post"
              target="_blank"
            >
              <input type="hidden" name="first_url" value="https://laninge.substack.com/" />
              <input type="hidden" name="first_referrer" value="" />
              <input type="hidden" name="current_url" value="https://laninge.com/" />
              <input type="hidden" name="current_referrer" value="" />
              <input
                type="email"
                name="email"
                placeholder="Din e-postadress"
                required
                className="top-bar-input"
              />
              <button type="submit" className="top-bar-btn">Prenumerera</button>
            </form>
            <a href="https://laninge.substack.com" target="_blank" rel="noopener noreferrer" className="top-bar-mobile-btn">
              Prenumerera
            </a>
            <button className="top-bar-close" onClick={() => setShowTopBar(false)} aria-label="Stäng">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-label">Sparpsykolog & författare</p>
            <h1 className="hero-title">Niklas Laninge</h1>
            <p className="hero-subtitle">
              Sparpsykolog hos Opti som pratar om pengar och dess roll i våra liv.
            </p>
            <div className="hero-cta">
              <a href="https://laninge.substack.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Prenumerera på nyhetsbrevet
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/niklas.jpg" alt="Niklas Laninge" />
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
              <p>Tre böcker om beteendedesign.</p>
            </div>
            <div className="about-card">
              <span className="about-icon">💰</span>
              <h3>Sparpsykolog</h3>
              <p>Optis talesperson som hjälper människor att börja spara, spara mer och fortsätta spara.</p>
            </div>
            <div className="about-card">
              <span className="about-icon">🎤</span>
              <h3>Mediaexpert</h3>
              <p>Psykolog som förklarar finansiella och privatekonomiska fenomen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="section section-books">
        <div className="section-content">
          <h2 className="section-label">Böcker</h2>
          <p className="section-intro">Tre böcker om beteendedesign</p>

          <div className="books-grid">
            <a href="https://www.adlibris.com/se/bok/beteendedesign-9789127819191" target="_blank" rel="noopener noreferrer" className="book-card">
              <div className="book-cover">
                <img src="https://www.adlibris.com/images/9789127819191/beteendedesign-psykologin-som-forandrar-tankar-kanslor-och-handlingar.jpg" alt="Beteendedesign" />
              </div>
              <div className="book-info">
                <div className="book-year">2017</div>
                <h3>Beteendedesign</h3>
                <p className="book-publisher">Natur & Kultur</p>
                <p>En praktisk guide till hur du kan använda beteendeekonomi för att designa bättre produkter och tjänster.</p>
              </div>
            </a>

            <a href="https://www.adlibris.com/se/bok/beslutfallan-9789188659583" target="_blank" rel="noopener noreferrer" className="book-card">
              <div className="book-cover">
                <img src="https://www.adlibris.com/images/9789188659583/beslutsfallan-genomskada-psykologin-som-styr-dina-val.jpg" alt="Beslutsfällan" />
              </div>
              <div className="book-info">
                <div className="book-year">2018</div>
                <h3>Beslutsfällan</h3>
                <p className="book-publisher">Volante</p>
                <p>Varför fattar vi dåliga beslut – och hur kan vi bli bättre? Om de psykologiska fällor som styr våra val.</p>
              </div>
            </a>

            <a href="https://www.adlibris.com/se/bok/digitala-beteenden-9789127824454" target="_blank" rel="noopener noreferrer" className="book-card">
              <div className="book-cover">
                <img src="https://www.adlibris.com/images/9789127824454/digitala-beteenden-en-verktygslada-for-kundfokuserad-design.jpg" alt="Digitala beteenden" />
              </div>
              <div className="book-info">
                <div className="book-year">2019</div>
                <h3>Digitala beteenden</h3>
                <p className="book-publisher">Natur & Kultur</p>
                <p>Hur påverkar den digitala världen oss? Om skärmtid, sociala medier och en sundare relation till teknik.</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Media Section */}
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
            </a>

            <a href="https://open.spotify.com/show/6x65WFaPmYlHLB19ECjh77" target="_blank" rel="noopener noreferrer" className="media-card">
              <span className="media-type">Podcast</span>
              <h3>Tidlösa sanningar om pengar</h3>
              <p>Podd om sparande och privatekonomi – med beteendevetenskapliga glasögon.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section section-newsletter">
        <div className="section-content">
          <h2 className="section-label">Senaste från nyhetsbrevet</h2>
          <p className="section-intro">Mina senaste nyhetsbrev</p>

          <div className="newsletter-list">
            {newsletters.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="newsletter-item">
                <span className="newsletter-number">#{item.title.match(/#(\d+)/)?.[1] || i + 1}</span>
                <span className="newsletter-title">{item.title}</span>
                <span className="newsletter-date">{formatDate(item.date)}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Press Section */}
      <section className="section section-press">
        <div className="section-content">
          <h2 className="section-label">I media</h2>
          <p className="section-intro">Urval av intervjuer och framträdanden</p>

          <div className="press-list">
            <a href="https://www.dn.se/insidan/sparpsykologen-impulsiva-personer-ar-hett-villebrad-under-black-week/" target="_blank" rel="noopener noreferrer" className="press-item">
              <span className="press-source">Dagens Nyheter</span>
              <span className="press-title">Impulsiva personer är hett villebråd under Black Week</span>
              <span className="press-date">Nov 2025</span>
            </a>

            <a href="https://www.dn.se/ekonomi/sparpsykologen-om-die-with-zero-kansligt-folk-hatar-att-tanka-pa-doden/" target="_blank" rel="noopener noreferrer" className="press-item">
              <span className="press-source">Dagens Nyheter</span>
              <span className="press-title">Om Die with Zero: "Känsligt – folk hatar att tänka på döden"</span>
              <span className="press-date">Okt 2025</span>
            </a>

            <a href="https://www.svtplay.se/video/ePBB221/ekonomibyran/sociala-mediers-dod" target="_blank" rel="noopener noreferrer" className="press-item">
              <span className="press-source">SVT Ekonomibyrån</span>
              <span className="press-title">Sociala mediers död</span>
              <span className="press-date">Okt 2025</span>
            </a>

            <a href="https://www.svtplay.se/video/KVwwppA/ekonomibyran/byta-bank" target="_blank" rel="noopener noreferrer" className="press-item">
              <span className="press-source">SVT Ekonomibyrån</span>
              <span className="press-title">Byta bank!?</span>
              <span className="press-date">Aug 2025</span>
            </a>

            <a href="https://www.realtid.se/spara-placera/psykologin-slar-fundamentan-borsen-trotsar-verkligheten/" target="_blank" rel="noopener noreferrer" className="press-item">
              <span className="press-source">Realtid</span>
              <span className="press-title">Psykologin slår fundamentan – börsen trotsar verkligheten</span>
              <span className="press-date">Jul 2025</span>
            </a>

            <a href="https://sverigesradio.se/planboken" target="_blank" rel="noopener noreferrer" className="press-item">
              <span className="press-source">Sveriges Radio P1</span>
              <span className="press-title">Plånboken – om sparande och konsumtion</span>
              <span className="press-date">2025</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-cta">
            <h2>Vill du boka mig?</h2>
            <p>Föreläsning, intervju eller expertkommentar – hör av dig.</p>
          </div>

          <div className="footer-contact">
            <a href="mailto:niklas.laninge@gmail.com" className="footer-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              niklas.laninge@gmail.com
            </a>
            <a href="tel:+46707514545" className="footer-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              0707 514545
            </a>
          </div>

          <div className="footer-social">
            <a href="https://www.linkedin.com/in/laninge/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/laninge/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Niklas Laninge</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
