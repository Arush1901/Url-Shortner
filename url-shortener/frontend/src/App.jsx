import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'https://url-shortner-1-zynn.onrender.com'

export default function App() {
  const [inputUrl, setInputUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

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
      const response = await axios.post(`${API_BASE}/api/shorten`, { url: inputUrl })
      setShortUrl(response.data.shortUrl)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleShorten()
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="logo">🔗</div>
          <h1>URL Shortener</h1>
          <p>Paste a long URL and get a short one instantly</p>
        </div>

        <div className="input-group">
          <input
            type="url"
            placeholder="https://your-very-long-url.com/goes/here"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="url-input"
          />
          <button
            onClick={handleShorten}
            disabled={loading}
            className="shorten-btn"
          >
            {loading ? <span className="spinner" /> : 'Shorten URL'}
          </button>
        </div>

        {error && (
          <div className="error-box">
            ⚠️ {error}
          </div>
        )}

        {shortUrl && (
          <div className="result-box">
            <p className="result-label">Your shortened URL:</p>
            <div className="result-row">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="short-url"
              >
                {shortUrl}
              </a>
              <button onClick={handleCopy} className="copy-btn">
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
