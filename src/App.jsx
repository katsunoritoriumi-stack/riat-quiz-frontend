import { useState, useEffect } from 'react'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ExplainScreen from './components/ExplainScreen'
import ResultScreen from './components/ResultScreen'
import { loadPool, pickQuizSet } from './quizPool'

const SET_SIZE = 10
const DIFFICULTY_LABELS = { easy: '初級', normal: '中級', hard: '上級' }

const scrollTop = () => setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0)

export default function App() {
  const [screen, setScreen] = useState('start')
  const [settings, setSettings] = useState({ category: '', difficulty: 'normal' })
  const [error, setError] = useState('')
  const [pool, setPool] = useState(null)

  const [quizSet, setQuizSet] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])   // 各問のユーザー選択インデックス

  // 起動時に事前生成クイズプールを1回だけ読み込む（実行時はAPIを呼ばない）
  useEffect(() => {
    loadPool()
      .then(setPool)
      .catch(() => setError('クイズデータの読み込みに失敗しました。時間をおいて再読み込みしてください。'))
  }, [])

  const startSet = (category, difficulty) => {
    const set = pickQuizSet(pool, category, difficulty, SET_SIZE)
    if (!set.length) {
      setError('クイズが見つかりませんでした。データの読み込みをお待ちください。')
      return
    }
    setSettings({ category, difficulty })
    setQuizSet(set)
    setCurrent(0)
    setAnswers([])
    setError('')
    setScreen('quiz')
    scrollTop()
  }

  const handleStart = ({ category, difficulty }) => startSet(category, difficulty)

  const handleAnswer = (choiceIndex) => {
    setAnswers(prev => {
      const next = prev.slice()
      next[current] = choiceIndex
      return next
    })
    setScreen('explain')
    scrollTop()
  }

  const handleNext = () => {
    if (current < quizSet.length - 1) {
      setCurrent(current + 1)
      setScreen('quiz')
    } else {
      setScreen('result')
    }
    scrollTop()
  }

  const handleRestart = () => startSet(settings.category, settings.difficulty)

  const handleBackToStart = () => {
    setScreen('start')
    setQuizSet([])
    setCurrent(0)
    setAnswers([])
    setError('')
  }

  const difficultyLabel = DIFFICULTY_LABELS[settings.difficulty] || settings.difficulty
  const categoryLabel = settings.category || 'おまかせ'
  const currentQ = quizSet[current]
  const score = answers.reduce((acc, a, i) => acc + (quizSet[i] && a === quizSet[i].answer_index ? 1 : 0), 0)

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
        {screen === 'quiz' && currentQ && (
          <QuizScreen
            quizData={currentQ}
            onAnswer={handleAnswer}
            onBack={handleBackToStart}
            current={current + 1}
            total={quizSet.length}
            categoryLabel={categoryLabel}
            difficultyLabel={difficultyLabel}
          />
        )}
        {screen === 'explain' && currentQ && (
          <ExplainScreen
            quizData={currentQ}
            userAnswer={answers[current]}
            onNext={handleNext}
            onBack={handleBackToStart}
            isLast={current === quizSet.length - 1}
            current={current + 1}
            total={quizSet.length}
          />
        )}
        {screen === 'result' && (
          <ResultScreen
            score={score}
            total={quizSet.length}
            quizSet={quizSet}
            answers={answers}
            categoryLabel={categoryLabel}
            difficultyLabel={difficultyLabel}
            onRestart={handleRestart}
            onHome={handleBackToStart}
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
