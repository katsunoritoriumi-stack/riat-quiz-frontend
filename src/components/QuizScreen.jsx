export default function QuizScreen({ quizData, onAnswer, onBack, current, total, categoryLabel, difficultyLabel }) {
  const { question, choices } = quizData
  const labels = ['A', 'B', 'C', 'D']

  return (
    <div>
      {/* 進捗 ＋ カテゴリ／難易度 */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 32, background: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '1rem', color: 'var(--ink)', letterSpacing: '0.06em' }}>
            問題 <strong style={{ color: 'var(--accent)' }}>{current}</strong> <span style={{ color: 'var(--muted)' }}>/ {total}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '4px 10px', background: 'var(--aged)', border: '1px solid #c8b89a', fontSize: '0.72rem', color: 'var(--ink)', letterSpacing: '0.04em' }}>{categoryLabel}</span>
          <span style={{ padding: '4px 10px', background: 'var(--aged)', border: '1px solid #c8b89a', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.04em' }}>{difficultyLabel}</span>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="animate-fade-up" style={{ height: 4, background: '#e6dcc8', marginBottom: 28 }}>
        <div style={{ width: `${(current / total) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
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
            onClick={() => onAnswer(i)}
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

      {/* 中断リンク */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', letterSpacing: '0.05em' }}
        >
          ← 中断してスタートに戻る
        </button>
      </div>
    </div>
  )
}
