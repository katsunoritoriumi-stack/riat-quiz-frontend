import { useState, useEffect, useRef } from 'react'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ExplainScreen from './components/ExplainScreen'

const API_URL = import.meta.env.VITE_API_URL || 'https://riat-quiz-app.onrender.com'

const fetchWithTimeout = (url, options = {}, timeout = 90000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

export default function App() {
  const [screen, setScreen] = useState('start')
  const [quizData, setQuizData] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)
  const [settings, setSettings] = useState({ category: '', difficulty: 'normal' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const quizQueueRef = useRef([])

  // アプリ起動時にバックエンドをウォームアップ
  useEffect(() => {
    fetchWithTimeout(`${API_URL}/warmup`).catch(() => {})
  }, [])

  const refillOne = async (category, difficulty) => {
    if (quizQueueRef.current.length >= 5) return
    console.log('[queue] 1問補充開始')
    try {
      const res = await fetchWithTimeout(`${API_URL}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, difficulty }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data) {
          quizQueueRef.current.push(data)
          console.log(`[queue] 1問補充完了 (キュー残数: ${quizQueueRef.current.length})`)
        } else {
          console.log('[queue] 補充失敗、リトライ')
          const retryRes = await fetchWithTimeout(`${API_URL}/generate-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, difficulty }),
          })
          if (retryRes.ok) {
            const retryData = await retryRes.json()
            if (retryData) quizQueueRef.current.push(retryData)
          }
        }
      }
    } catch (e) {
      console.log('[queue] 補充エラー')
    }
  }

  const handleStart = async ({ category, difficulty }) => {
    setSettings({ category, difficulty })
    setLoading(true)
    setError('')
    quizQueueRef.current = []
    try {
      const promises = Array.from({ length: 3 }, () =>
        fetchWithTimeout(`${API_URL}/generate-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, difficulty }),
        })
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
      )
      const results = await Promise.all(promises)
      results.forEach(data => {
        if (data) quizQueueRef.current.push(data)
      })

      const data = quizQueueRef.current.shift()
      if (!data) throw new Error('クイズの生成に失敗しました')

      setQuizData(data)
      setUserAnswer(null)
      setError('')
      setScreen('quiz')

      refillOne(category, difficulty)
      refillOne(category, difficulty)
    } catch (e) {
      setError(e.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (choiceIndex) => {
    setUserAnswer(choiceIndex)
    setScreen('explain')
    if (!quizData.explanation) {
      setLoading(true)
      try {
        const res = await fetchWithTimeout(`${API_URL}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: quizData.question,
            choices: quizData.choices,
            answer_index: quizData.answer_index,
            user_answer_index: choiceIndex,
            explanation: '',
            source_urls: quizData.source_urls,
            source_titles: quizData.source_titles,
            context: quizData.context,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.explanation) {
            setQuizData(prev => ({ ...prev, explanation: data.explanation }))
          }
        }
      } catch (e) {
        // 解説取得失敗は無視
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRetry = async () => {
    if (quizQueueRef.current.length > 0) {
      const data = quizQueueRef.current.shift()
      console.log(`[queue] キャッシュ使用 (残数: ${quizQueueRef.current.length})`)

      setQuizData(data)
      setUserAnswer(null)
      setError('')
      setScreen('quiz')

      refillOne(settings.category, settings.difficulty)
    } else {
      console.log('[queue] キュー空、API呼び出し')
      setLoading(true)
      setError('')
      try {
        const res = await fetchWithTimeout(`${API_URL}/generate-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        })
        if (!res.ok) throw new Error('クイズの生成に失敗しました')
        const data = await res.json()
        setQuizData(data)
        setUserAnswer(null)
        setError('')
        setScreen('quiz')

        refillOne(settings.category, settings.difficulty)
      } catch (e) {
        setError(e.message || 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBackToStart = () => {
    quizQueueRef.current = []
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
            loading={loading}
            loadingMessage="問題を3問準備中..."
          />
        )}
        {screen === 'quiz' && quizData && <QuizScreen quizData={quizData} onAnswer={handleAnswer} onBack={handleBackToStart} />}
        {screen === 'explain' && quizData && (
          <ExplainScreen
            quizData={quizData}
            userAnswer={userAnswer}
            onRetry={handleRetry}
            onBack={handleBackToStart}
            loading={loading}
          />
        )}
      </main>

      <footer style={{ borderTop: '1px solid #c8b89a', marginTop: 60, padding: '24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <p>Powered by Gemini AI × Pinecone — RIATブログ 407記事より生成</p>
        </div>
      </footer>
    </div>
  )
}
