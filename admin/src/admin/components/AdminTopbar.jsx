import { useState } from 'react';

const AdminTopbar = ({ title, actions, onToggle }) => {
  const [search, setSearch] = useState('');

  return (
    <div style={{
      height: 58, background: '#fff',
      borderBottom: '1px solid #e8e6e1',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 12, flexShrink: 0,
    }}>
      <button onClick={onToggle} style={{
        background: 'none', border: 'none',
        fontSize: 20, cursor: 'pointer', color: '#666', padding: 4,
      }}>☰</button>

      <h1 style={{
        flex: 1, fontSize: 18, fontWeight: 500,
        color: '#111', fontFamily: 'Georgia, serif',
      }}>{title}</h1>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f5f4f0', border: '1px solid #e8e6e1',
        borderRadius: 7, padding: '7px 12px', width: 220,
      }}>
        <span style={{ color: '#aaa', fontSize: 14 }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${title?.toLowerCase()}...`}
          style={{
            background: 'none', border: 'none', outline: 'none',
            fontSize: 12, color: '#111', width: '100%',
          }}
        />
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          width: 36, height: 36, border: '1px solid #e8e6e1',
          borderRadius: 7, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', fontSize: 16,
        }}>🔔</div>
        <div style={{
          position: 'absolute', top: -5, right: -5,
          background: '#111', color: '#fff', fontSize: 9,
          width: 17, height: 17, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700,
        }}>3</div>
      </div>

      {actions}
    </div>
  );
};

export default AdminTopbar;