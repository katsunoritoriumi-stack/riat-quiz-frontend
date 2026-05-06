import { useState } from 'react'

const CATEGORIES = [
  { value: '', label: 'おまかせ（ランダム）' },
  { value: '陰陽論・生命哲学', label: '陰陽論・生命哲学' },
  { value: '宇宙・銀河の歴史', label: '宇宙・銀河の歴史' },
  { value: '宇宙医学・健康', label: '宇宙医学・健康' },
  { value: 'ウイルス・感染症', label: 'ウイルス・感染症' },
  { value: '日本・龍神島の歴史', label: '日本・龍神島の歴史' },
  { value: '天体・地球環境', label: '天体・地球環境' },
]

const DIFFICULTIES = [
  { value: 'easy', label: '初級', desc: '基本的な内容' },
  { value: 'normal', label: '中級', desc: '標準的な難易度' },
  { value: 'hard', label: '上級', desc: '深い理解が必要' },
]

export default function StartScreen({ onStart, loading, loadingMessage }) {
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('normal')

  const handleSubmit = () => {
    if (!loading) onStart({ category, difficulty })
  }

  return (
    <div>
      {/* タイトルブロック */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: 16, fontFamily: "'Shippori Mincho', serif" }}>
          ── RIAT BLOG QUIZ ──
        </div>
        <h1 style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 16 }}>
          理論の知を<br />問う一問
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          407件のRIATブログ記事から<br />
          AIが生成するオリジナルクイズに挑戦しよう
        </p>
      </div>

      {/* カード */}
      <div className="card animate-fade-up delay-1" style={{ padding: '36px 32px' }}>
        {/* カテゴリ選択 */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontFamily: "'Shippori Mincho', serif", fontSize: '0.9rem', marginBottom: 10, color: 'var(--ink)', letterSpacing: '0.05em' }}>
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px',
              background: 'var(--paper)', border: '2px solid #c8b89a',
              color: 'var(--ink)', fontSize: '0.95rem', fontFamily: "'Zen Kaku Gothic New', sans-serif",
              outline: 'none', cursor: 'pointer',
            }}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* 難易度選択 */}
        <div style={{ marginBottom: 36 }}>
          <label style={{ display: 'block', fontFamily: "'Shippori Mincho', serif", fontSize: '0.9rem', marginBottom: 12, color: 'var(--ink)', letterSpacing: '0.05em' }}>
            難易度
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                style={{
                  padding: '14px 8px',
                  border: difficulty === d.value ? '2px solid var(--accent)' : '2px solid #c8b89a',
                  background: difficulty === d.value ? 'var(--aged)' : 'var(--paper)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: "'Shippori Mincho', serif", fontWeight: 700, fontSize: '1rem', color: difficulty === d.value ? 'var(--accent)' : 'var(--ink)', marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* スタートボタン */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1.05rem', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading ? (
            <>
              <span>{loadingMessage || 'AIがクイズを生成中'}</span>
              <span><span className="loading-dot">．</span><span className="loading-dot">．</span><span className="loading-dot">．</span></span>
            </>
          ) : (
            'クイズに挑戦する →'
          )}
        </button>

        {loading && (
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: 12 }}>
            ※ 初回アクセスはサーバー起動に50秒ほどかかる場合があります
          </p>
        )}
      </div>

      {/* 装飾 */}
      <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.2em', fontFamily: "'Shippori Mincho', serif" }}>
        ✦ ✦ ✦
      </div>
    </div>
  )
}
