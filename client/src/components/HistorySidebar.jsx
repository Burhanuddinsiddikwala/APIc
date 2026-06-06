import { useState, useEffect } from 'react'
import axios from 'axios'

const MC = {
  GET:    { bg:'var(--blue-bg)',  color:'var(--blue)'  },
  POST:   { bg:'var(--green-bg)', color:'var(--green)' },
  PUT:    { bg:'var(--amber-bg)', color:'var(--amber)' },
  PATCH:  { bg:'var(--amber-bg)', color:'var(--amber)' },
  DELETE: { bg:'var(--red-bg)',   color:'var(--red)'   },
}

function statusColor(c) {
  if (!c) return 'var(--text-muted)'
  if (c < 300) return 'var(--green)'
  if (c < 400) return 'var(--amber)'
  return 'var(--red)'
}

function ago(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400)return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function trimUrl(url) {
  try { return new URL(url).pathname } catch { return url }
}

export default function HistorySidebar({ refresh, onReplay }) {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/history`)
      setItems(data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [refresh])

  const del = async (e, id) => {
    e.stopPropagation()
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/history/${id}`)
    setItems(p => p.filter(i => i.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const clearAll = async () => {
    if (!confirm('Clear all history?')) return
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/history`)
    setItems([]); setSelected(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 14px', borderBottom:'1px solid var(--border)',
        flexShrink:0
      }}>
        <span style={{ fontSize:'12px', fontWeight:600, color:'var(--text-soft)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
          History
          {items.length > 0 && (
            <span className="font-mono" style={{ marginLeft:6, fontSize:'10px', padding:'1px 5px', borderRadius:'99px', background:'var(--surface2)', color:'var(--text-muted)' }}>
              {items.length}
            </span>
          )}
        </span>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              fontSize:'11px', padding:'3px 8px', borderRadius:'5px',
              background:'transparent', color:'var(--text-muted)',
              border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='#450A0A'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
          >
            Clear
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {loading && (
          <div style={{ padding:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="shimmer-line" style={{ height:'44px', borderRadius:'8px' }} />)}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ padding:'40px 16px', textAlign:'center' }}>
            <svg style={{ margin:'0 auto 10px', display:'block', opacity:0.2 }}
              width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" color="var(--text)">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>No requests yet</p>
          </div>
        )}

        {!loading && items.map((item, idx) => {
          const mc = MC[item.method] || MC.GET
          const isSel = selected?.id === item.id

          return (
            <div
              key={item.id}
              className="anim-fade-in"
              onClick={() => setSelected(isSel ? null : item)}
              style={{
                padding:'10px 12px', cursor:'pointer',
                borderBottom:'1px solid var(--border)',
                background: isSel ? 'var(--surface2)' : 'transparent',
                borderLeft: isSel ? '2px solid var(--green)' : '2px solid transparent',
                transition:'all 0.12s ease',
                animationDelay:`${idx * 25}ms`
              }}
              onMouseEnter={e => { if(!isSel) e.currentTarget.style.background='var(--surface2)' }}
              onMouseLeave={e => { if(!isSel) e.currentTarget.style.background='transparent' }}
            >
              {/* Row 1: method + path + delete */}
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                <span className={`font-mono pill-${item.method}`}
                  style={{ fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'4px', flexShrink:0 }}>
                  {item.method}
                </span>
                <span className="font-mono" style={{
                  fontSize:'11px', flex:1, overflow:'hidden',
                  textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-soft)'
                }} title={item.url}>
                  {trimUrl(item.url)}
                </span>
                <button
                  onClick={e => del(e, item.id)}
                  style={{
                    width:'18px', height:'18px', display:'flex', alignItems:'center',
                    justifyContent:'center', borderRadius:'4px',
                    background:'transparent', border:'none',
                    color:'var(--text-muted)', cursor:'pointer',
                    opacity:0, transition:'all 0.12s ease', flexShrink:0
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='var(--red-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent'; }}
                  ref={el => {
                    if (el) {
                      el.closest('[data-row]')
                    }
                  }}
                  onFocus={e => e.currentTarget.style.opacity='1'}
                  onBlur={e => e.currentTarget.style.opacity='0'}
                  className="del-btn"
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Row 2: status + duration + time */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'5px', paddingLeft:'1px' }}>
                <span className="font-mono" style={{ fontSize:'11px', fontWeight:600, color: statusColor(item.status) }}>
                  {item.status || '—'}
                </span>
                {item.duration && (
                  <span className="font-mono" style={{ fontSize:'10px', color:'var(--text-muted)' }}>{item.duration}ms</span>
                )}
                <span style={{ fontSize:'10px', color:'var(--text-muted)', marginLeft:'auto' }}>{ago(item.timestamp)}</span>
              </div>

              {/* Expanded */}
              {isSel && (
                <div className="anim-fade-in" style={{ marginTop:'10px' }}>
                  <div className="font-mono" style={{
                    fontSize:'10px', color:'var(--text-muted)', marginBottom:'8px',
                    wordBreak:'break-all', lineHeight:1.6,
                    padding:'6px 8px', background:'var(--surface3)', borderRadius:'6px'
                  }}>
                    {item.url}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onReplay(item) }}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', justifyContent:'center',
                      gap:'6px', padding:'7px', borderRadius:'7px', fontSize:'12px', fontWeight:600,
                      background:'var(--green)', color:'#000', border:'none', cursor:'pointer',
                      transition:'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#6EE7A0'}
                    onMouseLeave={e => e.currentTarget.style.background='var(--green)'}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Replay
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        div:hover .del-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
