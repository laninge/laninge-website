import './About.css'

function About() {
  return (
    <div className="about">
      <h1>Om mig</h1>

      <section className="about-intro">
        <p>
          Jag är legitimerad psykolog med specialisering inom beteendeekonomi och
          konsumentpsykologi. I min roll som sparpsykolog på Opti hjälper jag
          svenskar att bygga bättre sparvanor genom att förstå de psykologiska
          mekanismer som styr våra ekonomiska beslut.
        </p>
      </section>

      <section className="about-section">
        <h2>Expertis</h2>
        <p>
          Min expertis ligger i skärningspunkten mellan psykologi och ekonomi.
          Jag fokuserar på att förstå och förklara varför vi fattar de beslut
          vi gör - särskilt när det gäller pengar, konsumtion och sparande.
        </p>
        <ul>
          <li>Beteendeekonomi och nudging</li>
          <li>Konsumentpsykologi</li>
          <li>Sparande och privatekonomi</li>
          <li>Beteendedesign</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Media</h2>
        <p>
          Som expert i beteendeekonomi och konsumentpsykologi medverkar jag
          regelbundet i media för att förklara våra ekonomiska beteenden och
          ge råd om hur vi kan fatta bättre beslut.
        </p>
        <p>Jag har bland annat medverkat i:</p>
        <ul className="media-list">
          <li>TV4 Nyhetsmorgon</li>
          <li>Sveriges Radio P1</li>
          <li>Dagens Nyheter</li>
          <li>Dagens Industri</li>
          <li>Omni</li>
          <li>Svenska Dagbladet</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Författare</h2>
        <p>
          Tillsammans med Arvid Janson har jag skrivit tre böcker om
          beteendeekonomi och hur vi kan använda psykologiska insikter
          för att förstå och förändra beteenden. En fjärde bok är på väg.
        </p>
      </section>
    </div>
  )
}

export default About
