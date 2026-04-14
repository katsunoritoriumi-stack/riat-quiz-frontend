export default function ExplainScreen({ quizData, userAnswer, onRetry, onBack, loading }) {
  const { question, choices, answer_index, explanation, source_urls, source_titles } = quizData
  const isCorrect = userAnswer === answer_index
  const labels = ['A', 'B', 'C', 'D']

  const sources = (source_titles || []).map((title, i) => ({
    title,
    url: (source_urls || [])[i] || ''
  }))

  return (
    <div>
      {/* 正解/不正解バッジ */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px',
          background: isCorrect ? 'var(--correct)' : 'var(--wrong)',
          color: 'white', fontFamily: "'Shippori Mincho', serif",
          fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.1em',
        }}>
          {isCorrect ? '◯ 正解' : '✕ 不正解'}
        </div>
      </div>

      {/* 問題の振り返り */}
      <div className="card animate-fade-up delay-1" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10, fontFamily: "'Shippori Mincho', serif" }}>問題</div>
        <p style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '1rem', lineHeight: 1.8, color: 'var(--ink)', margin: '0 0 16px' }}>
          {question}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {choices.map((choice, i) => {
            let extraStyle = {}
            if (i === answer_index) {
              extraStyle = { background: '#e8f5e9', border: '2px solid var(--correct)', color: 'var(--correct)', fontWeight: 700 }
            } else if (i === userAnswer && i !== answer_index) {
              extraStyle = { background: '#fdf0f0', border: '2px solid var(--wrong)', color: 'var(--wrong)' }
            } else {
              extraStyle = { border: '1px solid #c8b89a', color: 'var(--muted)' }
            }
            return (
              <div key={i} style={{ padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem', lineHeight: 1.6, ...extraStyle }}>
                <span style={{ flexShrink: 0, fontFamily: "'Shippori Mincho', serif", fontWeight: 700 }}>{labels[i]}</span>
                <span>{choice}</span>
                {i === answer_index && <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.75rem' }}>← 正解</span>}
                {i === userAnswer && i !== answer_index && <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.75rem' }}>← あなたの回答</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 解説 */}
      <div className="animate-fade-up delay-2" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 28, background: 'var(--gold)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '0.9rem', color: 'var(--ink)', letterSpacing: '0.08em' }}>解説</span>
        </div>
        <div style={{ background: 'var(--aged)', padding: '24px 28px', border: '1px solid #c8b89a' }}>
          <p style={{ lineHeight: 2, fontSize: '0.92rem', color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
            {explanation || '解説を読み込み中...'}
          </p>
        </div>
      </div>

      {/* 参照記事 */}
      {sources.length > 0 && (
        <div className="animate-fade-up delay-3" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 4, height: 28, background: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '0.9rem', color: 'var(--ink)', letterSpacing: '0.08em' }}>参照ブログ記事</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sources.map((article, i) => (
              <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '14px 18px', border: '1px solid #c8b89a', background: 'var(--paper)', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.88rem', lineHeight: 1.5, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--aged)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.borderColor = '#c8b89a' }}
              >
                <div style={{ fontFamily: "'Shippori Mincho', serif", fontWeight: 600, marginBottom: 4 }}>{i + 1}. {article.title}</div>
                {article.url && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', wordBreak: 'break-all' }}>{article.url}</div>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="animate-fade-up delay-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={onBack} disabled={loading}
          style={{ padding: '14px', border: '2px solid #c8b89a', background: 'var(--paper)', fontFamily: "'Shippori Mincho', serif", fontSize: '0.95rem', cursor: 'pointer', color: 'var(--ink)', letterSpacing: '0.05em', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--aged)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)' }}
        >
          ← 最初に戻る
        </button>
        <button onClick={onRetry} disabled={loading} className="btn-primary"
          style={{ padding: '14px', fontSize: '0.95rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          {loading ? <>生成中<span className="loading-dot">．</span><span className="loading-dot">．</span><span className="loading-dot">．</span></> : 'もう一問 →'}
        </button>
      </div>
    </div>
  )
}
