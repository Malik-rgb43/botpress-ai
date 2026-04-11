'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>שגיאה</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>אירעה שגיאה. נסה לרענן את הדף.</p>
          <button onClick={reset} style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>
            נסה שוב
          </button>
        </div>
      </body>
    </html>
  )
}
