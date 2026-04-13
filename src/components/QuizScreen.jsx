export default function QuizScreen({ quizData, onAnswer, loading, onBack }) {
  const { question, choices } = quizData

  const labels = ['A', 'B', 'C', 'D']

  return (
    <div>
      {/* 問題ラベル */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 4, height: 32, background: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '0.85rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
          問題
        </span>
      </div>

      {/* 問題文 */}
      <div className="card animate-fade-up delay-1" style={{ padding: '32px 28px', marginBottom: 28 }}>
        <p style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 'clamp(1rem, 3vw, 1.2rem)', lineHeight: 1.9, color: 'var(--ink)', margin: 0 }}>
          {question}
        </p>
      </div>

      {/* 選択肢 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => !loading && onAnswer(i)}
            disabled={loading}
            className={`btn-choice animate-fade-up delay-${i + 1}`}
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: '0.95rem', lineHeight: 1.6 }}
          >
            <span style={{
              flexShrink: 0, width: 28, height: 28,
              background: 'var(--aged)', border: '1px solid #c8b89a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Shippori Mincho', serif", fontWeight: 700, fontSize: '0.85rem',
              color: 'var(--accent)',
            }}>
              {labels[i]}
            </span>
            <span>{choice}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--muted)', fontSize: '0.9rem' }}>
          <span>解説を生成中</span>
          <span><span className="loading-dot">．</span><span className="loading-dot">．</span><span className="loading-dot">．</span></span>
        </div>
      )}

      {/* 戻るリンク */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', letterSpacing: '0.05em' }}
        >
          ← スタートに戻る
        </button>
      </div>
    </div>
  )
}
