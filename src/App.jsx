import { useState } from 'react'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ExplainScreen from './components/ExplainScreen'

const API_URL = import.meta.env.VITE_API_URL || 'https://riat-quiz-app.onrender.com'

export default function App() {
  const [screen, setScreen] = useState('start')
  const [quizData, setQuizData] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)
  const [explainData, setExplainData] = useState(null)
  const [settings, setSettings] = useState({ category: '', difficulty: 'normal' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async ({ category, difficulty }) => {
    setSettings({ category, difficulty })
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, difficulty }),
      })
      if (!res.ok) throw new Error('クイズの生成に失敗しました')
      const data = await res.json()
      setQuizData(data)
      setUserAnswer(null)
      setExplainData(null)
      setScreen('quiz')
    } catch (e) {
      setError(e.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (choiceIndex) => {
    setUserAnswer(choiceIndex)
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: quizData.question,
          choices: quizData.choices,
          correct_index: quizData.correct_index,
          user_answer_index: choiceIndex,
          category: settings.category,
        }),
      })
      if (!res.ok) throw new Error('解説の取得に失敗しました')
      const data = await res.json()
      setExplainData(data)
      setScreen('explain')
    } catch (e) {
      setError(e.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => { handleStart(settings) }

  const handleBackToStart = () => {
    setScreen('start')
    setQuizData(null)
    setExplainData(null)
    setUserAnswer(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header style={{ borderBottom: '2px solid var(--gold)', background: 'var(--aged)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBackToStart} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper)', fontFamily: "'Shippori Mincho', serif", fontWeight: 700, fontSize: '1.1rem' }}>理</div>
            <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '1.1rem', color: 'var(--ink)', letterSpacing: '0.1em' }}>RIAT クイズ</span>
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>理論検索AIT — 知識を試す</span>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px' }}>
        {error && (
          <div style={{ background: '#fdf0f0', border: '1px solid var(--wrong)', color: 'var(--wrong)', padding: '12px 16px', marginBottom: 24, fontSize: '0.85rem' }}>
            ⚠ {error}
          </div>
        )}
        {screen === 'start' && <StartScreen onStart={handleStart} loading={loading} />}
        {screen === 'quiz' && quizData && <QuizScreen quizData={quizData} onAnswer={handleAnswer} loading={loading} onBack={handleBackToStart} />}
        {screen === 'explain' && explainData && <ExplainScreen quizData={quizData} explainData={explainData} userAnswer={userAnswer} onRetry={handleRetry} onBack={handleBackToStart} loading={loading} />}
      </main>

      <footer style={{ borderTop: '1px solid #c8b89a', marginTop: 60, padding: '24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <p>Powered by Gemini AI × Pinecone — RIATブログ 407記事より生成</p>
        </div>
      </footer>
    </div>
  )
}
