export default function ResultScreen({ score, total, quizSet, answers, categoryLabel, difficultyLabel, onRestart, onHome }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0

  let grade, gradeColor
  if (pct === 100) { grade = '満点！お見事です'; gradeColor = 'var(--correct)' }
  else if (pct >= 80) { grade = '素晴らしい理解度です'; gradeColor = 'var(--correct)' }
  else if (pct >= 60) { grade = 'よくできました'; gradeColor = 'var(--accent)' }
  else if (pct >= 40) { grade = 'もう少し！復習しましょう'; gradeColor = 'var(--gold)' }
  else { grade = '記事を読んで再挑戦しよう'; gradeColor = 'var(--wrong)' }

  const labels = ['A', 'B', 'C', 'D']

  return (
    <div>
      {/* スコア */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '0.85rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: 16 }}>── 結果 ──</div>
      </div>

      <div className="card animate-fade-up delay-1" style={{ padding: '36px 28px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          <span style={{ padding: '4px 12px', background: 'var(--aged)', border: '1px solid #c8b89a', fontSize: '0.74rem', color: 'var(--ink)' }}>{categoryLabel}</span>
          <span style={{ padding: '4px 12px', background: 'var(--aged)', border: '1px solid #c8b89a', fontSize: '0.74rem', color: 'var(--accent)' }}>{difficultyLabel}</span>
        </div>
        <div style={{ fontFamily: "'Shippori Mincho', serif", fontWeight: 800, color: 'var(--ink)', lineHeight: 1, marginBottom: 10 }}>
          <span style={{ fontSize: 'clamp(3rem, 14vw, 4.5rem)', color: 'var(--accent)' }}>{score}</span>
          <span style={{ fontSize: '1.6rem', color: 'var(--muted)' }}> / {total}</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>正答率 {pct}%</div>
        <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '1.05rem', fontWeight: 700, color: gradeColor }}>{grade}</div>
      </div>

      {/* 各問の正誤レビュー */}
      <div className="animate-fade-up delay-2" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 28, background: 'var(--gold)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '0.9rem', color: 'var(--ink)', letterSpacing: '0.08em' }}>解答の振り返り</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {quizSet.map((q, i) => {
            const ua = answers[i]
            const ok = ua === q.answer_index
            return (
              <div key={i} style={{ padding: '12px 14px', border: '1px solid #c8b89a', background: ok ? '#f1f8f1' : '#fdf3f3', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: ok ? 'var(--correct)' : 'var(--wrong)' }}>
                  {ok ? '◯' : '✕'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--ink)', marginBottom: ok ? 0 : 4 }}>
                    <span style={{ color: 'var(--muted)' }}>{i + 1}. </span>{q.question}
                  </div>
                  {!ok && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--correct)', lineHeight: 1.5 }}>
                      正解: {labels[q.answer_index]}. {q.choices[q.answer_index]}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* アクション */}
      <div className="animate-fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={onHome}
          style={{ padding: '14px', border: '2px solid #c8b89a', background: 'var(--paper)', fontFamily: "'Shippori Mincho', serif", fontSize: '0.95rem', cursor: 'pointer', color: 'var(--ink)', letterSpacing: '0.05em', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--aged)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)' }}
        >
          ← ホームへ
        </button>
        <button onClick={onRestart} className="btn-primary"
          style={{ padding: '14px', fontSize: '0.95rem', letterSpacing: '0.08em' }}
        >
          もう一度挑戦 →
        </button>
      </div>
    </div>
  )
}
