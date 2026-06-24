import { useState, useEffect } from 'react'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ExplainScreen from './components/ExplainScreen'
import { loadPool, pickQuiz } from './quizPool'

const scrollTop = () => setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0)

export default function App() {
  const [screen, setScreen] = useState('start')
  const [quizData, setQuizData] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)
  const [settings, setSettings] = useState({ category: '', difficulty: 'normal' })
  const [error, setError] = useState('')
  const [pool, setPool] = useState(null)

  // 起動時に事前生成クイズプールを1回だけ読み込む（実行時はAPIを呼ばない）
  useEffect(() => {
    loadPool()
      .then(setPool)
      .catch(() => setError('クイズデータの読み込みに失敗しました。時間をおいて再読み込みしてください。'))
  }, [])

  const showQuiz = (category, difficulty) => {
    const data = pickQuiz(pool, category, difficulty)
    if (!data) {
      setError('クイズが見つかりませんでした。データの読み込みをお待ちください。')
      return
    }
    setQuizData(data)
    setUserAnswer(null)
    setError('')
    setScreen('quiz')
    scrollTop()
  }

  const handleStart = ({ category, difficulty }) => {
    setSettings({ category, difficulty })
    showQuiz(category, difficulty)
  }

  // プールの問題は解説を含むので、そのまま解説画面へ
  const handleAnswer = (choiceIndex) => {
    setUserAnswer(choiceIndex)
    setScreen('explain')
    scrollTop()
  }

  const handleRetry = () => {
    showQuiz(settings.category, settings.difficulty)
  }

  const handleBackToStart = () => {
    setScreen('start')
    setQuizData(null)
    setUserAnswer(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header style={{ borderBottom: '2px solid var(--gold)', background: 'var(--aged)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBackToStart} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper)', fontFamily: "'Shippori Mincho', serif", fontWeight: 700, fontSize: '1.1rem' }}>R</div>
            <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '1.1rem', color: 'var(--ink)', letterSpacing: '0.1em' }}>宇宙生命論クイズ</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px' }}>
        {error && (
          <div style={{ background: '#fdf0f0', border: '1px solid var(--wrong)', color: 'var(--wrong)', padding: '12px 16px', marginBottom: 24, fontSize: '0.85rem' }}>
            ⚠ {error}
          </div>
        )}
        {screen === 'start' && (
          <StartScreen
            onStart={handleStart}
            loading={!pool}
            loadingMessage="問題を準備中..."
          />
        )}
        {screen === 'quiz' && quizData && <QuizScreen quizData={quizData} onAnswer={handleAnswer} onBack={handleBackToStart} />}
        {screen === 'explain' && quizData && (
          <ExplainScreen
            quizData={quizData}
            userAnswer={userAnswer}
            onRetry={handleRetry}
            onBack={handleBackToStart}
            loading={false}
          />
        )}
      </main>

      <footer style={{ borderTop: '1px solid #c8b89a', marginTop: 60, padding: '24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <p>Powered by Claude — RIATブログ 407記事より生成</p>
        </div>
      </footer>
    </div>
  )
}
