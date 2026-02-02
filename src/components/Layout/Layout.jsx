import { NavLink } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  return (
    <>
      <header className="header">
        <div className="header-content">
          <NavLink to="/" className="logo">
            Niklas Laninge
          </NavLink>
          <nav className="nav">
            <NavLink to="/om" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Om mig
            </NavLink>
            <NavLink to="/bocker" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Böcker
            </NavLink>
            <NavLink to="/aktuellt" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Aktuellt
            </NavLink>
            <NavLink to="/kontakt" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Kontakt
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Niklas Laninge</p>
        </div>
      </footer>
    </>
  )
}

export default Layout
