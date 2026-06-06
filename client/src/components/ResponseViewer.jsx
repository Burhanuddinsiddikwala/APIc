import { useState } from 'react'

function statusClass(code) {
  if (!code) return ''
  if (code < 300) return 'status-2xx'
  if (code < 400) return 'status-3xx'
  if (code < 500) return 'status-4xx'
  return 'status-5xx'
}

function prettyJSON(data) {
  try {
    if (typeof data === 'string') return JSON.stringify(JSON.parse(data), null, 2)
    return JSON.stringify(data, null, 2)
  } catch { return String(data) }
}

function colorJSON(line) {
  return line
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(".*?")(\s*:)/g, '<span style="color:#60A5FA">$1</span>$2')
    .replace(/:\s*(".*?")/g, ': <span style="color:#A3E635">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span style="color:#FB923C">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#F472B6">$1</span>')
    .replace(/:\s*(null)/g, ': <span style="color:#6B7280">$1</span>')
}

function fileSize(str) {
  const bytes = new Blob([str]).size
  return bytes > 1024 ? `${(bytes/1024).toFixed(1)} KB` : `${bytes} B`
}

export default function ResponseViewer({ response, loading }) {
  const [tab, setTab] = useState('body')

  if (loading) {
    return (
      <div className="panel" style={{ padding:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
          <div className="spinner" />
          <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>Waiting for response…</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[70,50,85,40,65].map((w,i) => (
            <div key={i} className="shimmer-line" style={{ width:`${w}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="panel" style={{
        padding:'48px 24px', display:'flex',
        flexDirection:'column', alignItems:'center', textAlign:'center'
      }}>
        <div style={{
          width:'44px', height:'44px', borderRadius:'10px',
          background:'var(--surface2)', border:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-muted)' }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <p style={{ fontSize:'15px', fontWeight:500, marginBottom:4, color:'var(--text-soft)' }}>No response yet</p>
        <p style={{ fontSize:'13px', color:'var(--text-muted)', margin:0 }}>Enter a URL and hit Send</p>
      </div>
    )
  }

  if (response.error) {
    return (
      <div className="panel anim-response" style={{ padding:'16px' }}>
        <div style={{
          display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px 14px',
          borderRadius:'8px', background:'var(--red-bg)', border:'1px solid #450A0A'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color:'var(--red)', flexShrink:0, marginTop:1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="font-mono" style={{ fontSize:'12px', color:'var(--red)', margin:0, lineHeight:1.6 }}>{response.error}</p>
        </div>
      </div>
    )
  }

  const sc = statusClass(response.status)
  const bodyText = prettyJSON(response.data)
  const lines = bodyText.split('\n')
  const resHeaders = response.headers || {}

  return (
    <div className="panel anim-response">
      {/* Status bar */}
      <div style={{
        display:'flex', alignItems:'center', gap:'10px',
        padding:'10px 16px', borderBottom:'1px solid var(--border)',
        background:'var(--surface2)'
      }}>
        <span className={`font-mono ${sc}`} style={{ fontSize:'12px', fontWeight:600, padding:'2px 8px', borderRadius:'5px' }}>
          {response.status}
        </span>
        <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>{response.statusText}</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'14px' }}>
          {response.duration && (
            <span className="font-mono" style={{ fontSize:'11px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {response.duration}ms
            </span>
          )}
          <span className="font-mono" style={{ fontSize:'11px', color:'var(--text-muted)' }}>
            {fileSize(bodyText)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--surface2)', padding:'0 4px' }}>
        {['body','headers'].map(t => (
          <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==='headers' && (
              <span className="font-mono" style={{ marginLeft:5, fontSize:'10px', padding:'1px 5px', borderRadius:'99px', background:'var(--surface3)', color:'var(--text-muted)' }}>
                {Object.keys(resHeaders).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      {tab === 'body' && (
        <div style={{ overflowX:'auto', maxHeight:'440px', overflowY:'auto' }}>
          {/* Line numbers + code */}
          <div style={{ display:'flex', minWidth:'100%' }}>
            {/* Line numbers */}
            <div className="font-mono" style={{
              padding:'14px 0', borderRight:'1px solid var(--border)',
              background:'var(--surface2)', userSelect:'none', flexShrink:0
            }}>
              {lines.map((_,i) => (
                <div key={i} style={{ padding:'0 12px', lineHeight:'1.7', fontSize:'11px', color:'var(--text-muted)', textAlign:'right' }}>
                  {i+1}
                </div>
              ))}
            </div>
            {/* Code */}
            <pre className="font-mono" style={{
              flex:1, margin:0, padding:'14px 16px', fontSize:'12px',
              lineHeight:'1.7', color:'var(--text)', background:'var(--surface)',
              whiteSpace:'pre', overflowX:'auto'
            }}>
              {lines.map((line, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: colorJSON(line) }} />
              ))}
            </pre>
          </div>
        </div>
      )}

      {/* Headers */}
      {tab === 'headers' && (
        <div style={{ overflowY:'auto', maxHeight:'440px' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              {Object.entries(resHeaders).map(([k,v]) => (
                <tr key={k} style={{ borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td className="font-mono" style={{ padding:'9px 16px', fontSize:'12px', color:'var(--blue)', width:'38%', verticalAlign:'top' }}>{k}</td>
                  <td className="font-mono" style={{ padding:'9px 16px', fontSize:'12px', color:'var(--text-soft)', wordBreak:'break-all' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
