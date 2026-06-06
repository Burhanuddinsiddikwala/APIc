export default function HeadersEditor({ rows, onChange, newRow }) {
  const update = (id, field, val) =>
    onChange(rows.map(r => r.id === id ? { ...r, [field]: val } : r))

  const remove = (id) => {
    const next = rows.filter(r => r.id !== id)
    onChange(next.length ? next : [newRow()])
  }

  const inputStyle = {
    flex:1, fontFamily:'JetBrains Mono, monospace', fontSize:'12px',
    padding:'7px 10px', borderRadius:'6px', border:'1px solid var(--border)',
    background:'var(--surface2)', color:'var(--text)', outline:'none',
    transition:'border-color 0.15s ease'
  }

  return (
    <div style={{ padding:'14px' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {rows.map(row => (
          <div key={row.id} className="anim-fade-in"
            style={{ display:'flex', alignItems:'center', gap:'8px' }}
          >
            <input
              value={row.key}
              onChange={e => update(row.id, 'key', e.target.value)}
              placeholder="Header name"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              spellCheck={false}
            />
            <input
              value={row.value}
              onChange={e => update(row.id, 'value', e.target.value)}
              placeholder="Value"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              spellCheck={false}
            />
            <button
              onClick={() => remove(row.id)}
              style={{
                width:'28px', height:'28px', flexShrink:0,
                borderRadius:'6px', border:'1px solid transparent',
                background:'transparent', color:'var(--text-muted)',
                cursor:'pointer', display:'flex', alignItems:'center',
                justifyContent:'center', transition:'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='#450A0A'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='transparent'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => onChange([...rows, newRow()])}
        style={{
          marginTop:'10px', display:'flex', alignItems:'center', gap:'5px',
          fontSize:'12px', fontWeight:500, padding:'5px 10px', borderRadius:'6px',
          background:'var(--surface2)', color:'var(--text-muted)',
          border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--green-bg)'; e.currentTarget.style.color='var(--green)'; e.currentTarget.style.borderColor='#14532D'; }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add header
      </button>
    </div>
  )
}
