import { useState, useEffect } from 'react'

function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'granted')
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
    })
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'denied')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: '#1a1a2e',
      borderTop: '1px solid rgba(99, 102, 241, 0.3)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      fontSize: '14px',
      color: '#e0e0e0',
    }}>
      <p style={{ margin: 0 }}>
        Vi använder cookies för att förstå hur sajten används.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleAccept} style={{
          background: '#6366f1',
          color: 'white',
          border: 'none',
          padding: '8px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}>
          Godkänn
        </button>
        <button onClick={handleDecline} style={{
          background: 'transparent',
          color: '#a0a0b0',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '8px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
        }}>
          Neka
        </button>
      </div>
    </div>
  )
}

export default CookieConsent
