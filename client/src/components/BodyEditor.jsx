export default function BodyEditor({ value, onChange, method }) {
  if (['GET','DELETE'].includes(method)) {
    return (
      <div style={{ padding:'32px 16px', textAlign:'center', color:'var(--text-muted)' }}>
        <svg style={{ margin:'0 auto 10px', display:'block', opacity:0.3 }}
          width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ fontSize:'13px', margin:0 }}>{method} requests don't have a body</p>
      </div>
    )
  }

  const format = () => {
    try { onChange(JSON.stringify(JSON.parse(value), null, 2)) } catch {}
  }

  return (
    <div>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 14px 6px',
        borderBottom:'1px solid var(--border)'
      }}>
        <span className="font-mono" style={{ fontSize:'11px', color:'var(--text-muted)' }}>
          application/json
        </span>
        <button
          onClick={format}
          className="font-mono"
          style={{
            fontSize:'11px', padding:'3px 8px', borderRadius:'5px',
            background:'var(--surface2)', color:'var(--text-muted)',
            border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--green)'; e.currentTarget.style.borderColor='#14532D'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
        >
          Format JSON
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={'{\n  "key": "value"\n}'}
        rows={9}
        className="font-mono"
        style={{
          width:'100%', padding:'14px', fontSize:'12px',
          background:'var(--surface)', color:'var(--text)',
          border:'none', outline:'none', resize:'none', lineHeight:1.7,
          borderRadius:0
        }}
        spellCheck={false}
      />
    </div>
  )
}
