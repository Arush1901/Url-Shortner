import { useState, useEffect } from 'react'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'

const API_BASE = 'https://url-shortner-1-zynn.onrender.com'

export default function App() {
  const [inputUrl, setInputUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [allLinks, setAllLinks] = useState([])
  const [showDashboard, setShowDashboard] = useState(false)
  const [dashLoading, setDashLoading] = useState(false)

  const fetchAllLinks = async () => {
    setDashLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/api/all`)
      setAllLinks(res.data)
    } catch {
      /* silently fail */
    } finally {
      setDashLoading(false)
    }
  }

  useEffect(() => {
    if (showDashboard) fetchAllLinks()
  }, [showDashboard])

  const handleShorten = async () => {
    if (!inputUrl.trim()) {
      setError('Please enter a URL.')
      return
    }

    setLoading(true)
    setError('')
    setShortUrl('')
    setCopied(false)

    try {
      const payload = { url: inputUrl }
      if (customCode.trim()) payload.customCode = customCode.trim()
      const response = await axios.post(`${API_BASE}/api/shorten`, payload)
      setShortUrl(response.data.shortUrl)
      if (showDashboard) fetchAllLinks()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text || shortUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleToggle = async (code) => {
    try {
      await axios.put(`${API_BASE}/api/toggle/${code}`)
      fetchAllLinks()
    } catch {
      /* silently fail */
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleShorten()
  }

  const totalClicks = allLinks.reduce((sum, l) => sum + l.clickCount, 0)

  return (
    <div className="container">
      {/* Shorten Card */}
      <div className="card">
        <div className="header">
          <div className="logo">🔗</div>
          <h1>URL Shortener</h1>
          <p>Paste a long URL and get a short one instantly</p>
        </div>

        <div className="input-group">
          <input
            id="url-input"
            type="url"
            placeholder="https://your-very-long-url.com/goes/here"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="url-input"
          />
          <button
            id="shorten-btn"
            onClick={handleShorten}
            disabled={loading}
            className="shorten-btn"
          >
            {loading ? <span className="spinner" /> : 'Shorten URL'}
          </button>
        </div>

        <div className="custom-alias-row">
          <input
            id="custom-alias-input"
            type="text"
            placeholder="Custom alias (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="alias-input"
          />
        </div>

        {error && (
          <div className="error-box" id="error-box">
            ⚠️ {error}
          </div>
        )}

        {shortUrl && (
          <div className="result-box" id="result-box">
            <p className="result-label">Your shortened URL:</p>
            <div className="result-row">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="short-url"
                id="short-url-link"
              >
                {shortUrl}
              </a>
              <button onClick={() => handleCopy(shortUrl)} className="copy-btn" id="copy-btn">
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div className="qr-section">
              <QRCodeSVG
                value={shortUrl}
                size={140}
                bgColor="transparent"
                fgColor="#4f46e5"
                level="M"
              />
              <span className="qr-label">Scan to open</span>
            </div>
          </div>
        )}

        <button
          id="dashboard-toggle"
          className="dashboard-toggle-btn"
          onClick={() => setShowDashboard((v) => !v)}
        >
          {showDashboard ? '✕ Hide Dashboard' : '📊 Show Dashboard'}
        </button>
      </div>

      {/* Dashboard */}
      {showDashboard && (
        <div className="card dashboard-card">
          <h2 className="dash-title">📊 Analytics Dashboard</h2>

          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-number">{allLinks.length}</span>
              <span className="stat-label">Total Links</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{totalClicks}</span>
              <span className="stat-label">Total Clicks</span>
            </div>
          </div>

          {dashLoading ? (
            <div className="dash-loading">
              <span className="spinner" />
            </div>
          ) : allLinks.length === 0 ? (
            <p className="no-links">No links yet. Shorten one above!</p>
          ) : (
            <div className="link-list">
              {allLinks.map((link) => (
                <div
                  key={link.shortCode}
                  className={`link-item ${!link.active ? 'disabled-link' : ''}`}
                >
                  <div className="link-info">
                    <a
                      href={`${API_BASE}/${link.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-code"
                    >
                      /{link.shortCode}
                    </a>
                    <span className="link-original" title={link.originalUrl}>
                      {link.originalUrl.length > 50
                        ? link.originalUrl.slice(0, 50) + '…'
                        : link.originalUrl}
                    </span>
                    <div className="link-meta">
                      <span className="click-badge">🖱 {link.clickCount}</span>
                      <span className="date-badge">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`status-badge ${link.active ? 'active' : 'inactive'}`}>
                        {link.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div className="link-actions">
                    <button
                      className={`toggle-btn ${link.active ? 'on' : 'off'}`}
                      onClick={() => handleToggle(link.shortCode)}
                      title={link.active ? 'Disable link' : 'Enable link'}
                    >
                      {link.active ? '🟢 Enabled' : '🔴 Disabled'}
                    </button>
                    <button
                      className="copy-btn small"
                      onClick={() => {
                        navigator.clipboard.writeText(`${API_BASE}/${link.shortCode}`)
                      }}
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
