import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="app">
      <div className="container">
        <div className="logo">
          <div className="scales-icon">
            <div className="column left"></div>
            <div className="column right"></div>
            <div className="crossbar"></div>
            <div className="pan left-pan"></div>
            <div className="pan right-pan"></div>
          </div>
          <h1 className="company-name">Ex Lège</h1>
          <p className="tagline">ATTORNEY OFFICE</p>
        </div>

        <div className="content">
          <h2 className="main-heading">UNDER CONSTRUCTION</h2>
          <p className="sub-heading">SITE NEARLY READY</p>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <button className="notify-btn">Notify Me!</button>
        </div>

        <div className="social-links">
          <a href="https://www.facebook.com/exlegeattorneyoffice" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/exlege_attorney_office/" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323z"/>
            </svg>
          </a>
        </div>

        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <a href="mailto:info@exlege.am" className="contact-link">info@exlege.am</a>
          </div>
          <div className="contact-item">
            <span className="contact-label">Phone:</span>
            <a href="tel:+37499377255" className="contact-link">+374 99 377 255</a>
          </div>
        </div>

        <div className="footer">
          <p>© 2025 by Ex Lège. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default App
