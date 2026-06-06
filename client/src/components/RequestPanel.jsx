import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import HeadersEditor from './HeadersEditor'
import BodyEditor from './BodyEditor'

const METHODS = ['GET','POST','PUT','PATCH','DELETE']
let idCtr = 0
const newRow = () => ({ id: ++idCtr, key:'', value:'' })

export default function RequestPanel({ onResponse, onLoading, replayRequest, onReplayConsumed }) {
  const [method,  setMethod]  = useState('GET')
  const [url,     setUrl]     = useState('')
  const [headers, setHeaders] = useState([newRow()])
  const [body,    setBody]    = useState('')
  const [tab,     setTab]     = useState('headers')
  const [sending, setSending] = useState(false)
  const [urlFocused, setUrlFocused] = useState(false)
  const urlRef = useRef(null)

  useEffect(() => {
    if (!replayRequest) return
    setMethod(replayRequest.method || 'GET')
    setUrl(replayRequest.url || '')
    try {
      const h = JSON.parse(replayRequest.request_headers || '{}')
      const rows = Object.entries(h).map(([k,v]) => ({ id: ++idCtr, key:k, value:v }))
      setHeaders(rows.length ? rows : [newRow()])
    } catch { setHeaders([newRow()]) }
    try {
      const b = replayRequest.request_body
      setBody(b && b !== 'null' ? (typeof b === 'string' ? b : JSON.stringify(b,null,2)) : '')
    } catch { setBody('') }
    onReplayConsumed()
    urlRef.current?.focus()
  }, [replayRequest])

  const buildHeaders = () => {
    const obj = {}
    headers.forEach(({ key, value }) => { if (key.trim()) obj[key.trim()] = value })
    return obj
  }

  const send = async () => {
    if (!url.trim()) { urlRef.current?.focus(); return }
    setSending(true); onLoading(true)
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/proxy`,
        { method, url: url.trim(), headers: buildHeaders(), body: body || null }
      )
      onResponse(data)
    } catch (err) {
      onResponse({ error: err.message })
    } finally {
      setSending(false); onLoading(false)
    }
  }

  const activeHeaders = headers.filter(h => h.key.trim()).length

  return (
    <div className="panel">
      {/* URL Row */}
      <div style={{
        display:'flex', alignItems:'stretch',
        borderBottom: `1px solid ${urlFocused ? 'var(--green)' : 'var(--border)'}`,
        transition:'border-color 0.15s ease',
        boxShadow: urlFocused ? '0 0 0 1px rgba(74,222,128,0.1) inset' : 'none'
      }}>
        {/* Method */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            className={`font-mono pill-${method}`}
            style={{
              appearance:'none', fontSize:'12px', fontWeight:600,
              padding:'0 32px 0 14px', height:'100%', minWidth:'100px',
              cursor:'pointer', border:'none', borderRight:'1px solid var(--border)',
              borderRadius:0, outline:'none', boxShadow:'none'
            }}
          >
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <svg style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', opacity:0.5 }}
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {/* URL input */}
        <input
          ref={urlRef}
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onFocus={() => setUrlFocused(true)}
          onBlur={() => setUrlFocused(false)}
          onKeyDown={e => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && send()}
          placeholder="https://api.example.com/endpoint"
          className="font-mono"
          style={{
            flex:1, padding:'13px 16px', fontSize:'13px',
            background:'transparent', border:'none', outline:'none',
            boxShadow:'none', color:'var(--text)'
          }}
          spellCheck={false}
        />

        {/* Send */}
        <button
          onClick={send}
          disabled={sending}
          className="send-btn"
          style={{ padding:'0 24px', borderRadius:0, minWidth:'100px', justifyContent:'center' }}
          title="Send (Ctrl+Enter)"
        >
          {sending ? (
            <><div className="spinner" style={{ borderTopColor:'#000' }} /><span>Sending</span></>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display:'flex', alignItems:'center',
        borderBottom:'1px solid var(--border)',
        background:'var(--surface2)', padding:'0 4px'
      }}>
        {['headers','body'].map(t => (
          <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==='headers' && activeHeaders > 0 && (
              <span className="font-mono" style={{
                marginLeft:6, fontSize:'10px', padding:'1px 5px',
                borderRadius:'99px', background:'var(--green-bg)', color:'var(--green)'
              }}>{activeHeaders}</span>
            )}
          </button>
        ))}
        <span className="font-mono" style={{ marginLeft:'auto', fontSize:'11px', color:'var(--text-muted)', paddingRight:14 }}>
          Ctrl+Enter
        </span>
      </div>

      {/* Tab content */}
      <div style={{ background:'var(--surface)' }}>
        {tab === 'headers' && <HeadersEditor rows={headers} onChange={setHeaders} newRow={newRow} />}
        {tab === 'body'    && <BodyEditor value={body} onChange={setBody} method={method} />}
      </div>
    </div>
  )
}
