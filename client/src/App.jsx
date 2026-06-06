import { useState, useCallback } from 'react'
import { ThemeProvider, useTheme } from './ThemeContext.jsx'
import RequestPanel from './components/RequestPanel'
import ResponseViewer from './components/ResponseViewer'
import HistorySidebar from './components/HistorySidebar'
import './index.css'

function Inner() {
  const { theme, toggle } = useTheme()
  const [response, setResponse]      = useState(null)
  const [loading, setLoading]        = useState(false)
  const [historyRefresh, setRefresh] = useState(0)
  const [replayRequest, setReplay]   = useState(null)
  const [sidebarOpen, setSidebar]    = useState(true)

  const handleResponse = useCallback((res) => {
    setResponse(res)
    setRefresh(n => n + 1)
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)' }}>
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', height:'52px', flexShrink:0,
        background:'var(--surface)', borderBottom:'1px solid var(--border)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'28px', height:'28px', borderRadius:'7px',
            background:'var(--green)', display:'flex', alignItems:'center',
            justifyContent:'center', fontWeight:700, fontSize:'13px', color:'#000'
          }}>A</div>
          <span style={{ fontFamily:'DM Serif Display, serif', fontSize:'18px', letterSpacing:'-0.3px', color:'var(--text)' }}>
            API<span style={{ color:'var(--green)' }}>c</span>
          </span>
          <span className="font-mono" style={{
            fontSize:'10px', padding:'2px 7px', borderRadius:'99px',
            background:'var(--green-bg)', color:'var(--green)', border:'1px solid #14532D'
          }}>v1.0</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {/* Theme Toggle */}
          <button onClick={toggle}
            style={{
              width:'42px', height:'24px', borderRadius:'99px',
              background: theme === 'dark' ? 'var(--green)' : '#374151',
              border:'none', cursor:'pointer', position:'relative',
              transition:'background 0.3s ease', padding:'2px'
            }}
          >
            <div style={{
              width:'20px', height:'20px', borderRadius:'50%',
              background:'white', position:'absolute', top:'2px',
              transition:'left 0.3s ease',
              left: theme === 'dark' ? '20px' : '2px',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'11px'
            }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </button>

          <div style={{ width:'1px', height:'16px', background:'var(--border)', margin:'0 4px' }} />
          <button
            onClick={() => setSidebar(o => !o)}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              padding:'5px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:500,
              cursor:'pointer', transition:'all 0.15s ease',
              background: sidebarOpen ? 'var(--green-bg)' : 'var(--surface2)',
              color: sidebarOpen ? 'var(--green)' : 'var(--text-muted)',
              border: `1px solid ${sidebarOpen ? '#14532D' : 'var(--border)'}`,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            History
          </button>
        </div>
      </header>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <main style={{
          flex:1, display:'flex', flexDirection:'column',
          gap:'14px', padding:'18px', overflowY:'auto', minWidth:0
        }}>
          <div className="anim-fade-up" style={{ animationDelay:'0ms' }}>
            <RequestPanel onResponse={handleResponse} onLoading={setLoading} replayRequest={replayRequest} onReplayConsumed={() => setReplay(null)} />
          </div>
          <div className="anim-fade-up" style={{ animationDelay:'50ms' }}>
            <ResponseViewer response={response} loading={loading} />
          </div>
        </main>
        {sidebarOpen && (
          <aside className="anim-slide-in" style={{
            width:'280px', flexShrink:0,
            borderLeft:'1px solid var(--border)',
            background:'var(--surface)', overflowY:'auto'
          }}>
            <HistorySidebar refresh={historyRefresh} onReplay={setReplay} />
          </aside>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  )
}
