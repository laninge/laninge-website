import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Books from './pages/Books'
import Feed from './pages/Feed'
import Contact from './pages/Contact'
import './App.css'

function App() {
  return (
    <div className="app">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/om" element={<About />} />
          <Route path="/bocker" element={<Books />} />
          <Route path="/aktuellt" element={<Feed />} />
          <Route path="/kontakt" element={<Contact />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
