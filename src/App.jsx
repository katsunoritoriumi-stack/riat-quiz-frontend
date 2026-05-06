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
  const isFillingQueueRef = useRef(false)

  // アプリ起動時にバックエンドをウォームアップ
  useEffect(() => {
    fetchWithTimeout(`${API_URL}/warmup`).catch(() => {})
  }, [])

  const fillQueue = async (category, difficulty) => {
    if (isFillingQueueRef.current) return
    if (quizQueueRef.current.length >= 5) return
    isFillingQueueRef.current = true
    const needed = 5 - quizQueueRef.current.length
    console.log(`[queue] 補充開始 (${needed}問)`)
    const promises = Array.from({ length: needed }, () =>
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
    const retries = results
      .map((r, i) => r === null ? i : null)
      .filter(i => i !== null)
    if (retries.length > 0) {
      console.log(`[queue] リトライ (${retries.length}問)`)
      const retryPromises = retries.map(() =>
        fetchWithTimeout(`${API_URL}/generate-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, difficulty }),
        })
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
      )
      const retryResults = await Promise.all(retryPromises)
      retryResults.forEach(data => {
        if (data) quizQueueRef.current.push(data)
      })
    }
    console.log(`[queue] 補充完了 (キュー残数: ${quizQueueRef.current.length})`)
    isFillingQueueRef.current = false
  }

  const handleStart = async ({ category, difficulty }) => {
    setSettings({ category, difficulty })
    setLoading(true)
    setError('')
    quizQueueRef.current = []
    isFillingQueueRef.current = false
    try {
      await fillQueue(category, difficulty)
      const data = quizQueueRef.current.shift()
      if (!data) throw new Error('クイズの生成に失敗しました')
      setQuizData(data)
      setUserAnswer(null)
      setError('')
      setScreen('quiz')
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
    // キューが残り1問以下ならバックグラウンドで補充
    if (quizQueueRef.current.length <= 2) {
      fillQueue(settings.category, settings.difficulty)
    }

    if (quizQueueRef.current.length > 0) {
      // キューから即座に取り出す（待ち時間0）
      console.log(`[queue] キャッシュ使用 (残数: ${quizQueueRef.current.length - 1})`)
      const data = quizQueueRef.current.shift()
      setQuizData(data)
      setUserAnswer(null)
      setError('')
      setScreen('quiz')
    } else {
      // キューが空の場合は通常API呼び出し
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
      } catch (e) {
        setError(e.message || 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBackToStart = () => {
    quizQueueRef.current = []
    isFillingQueueRef.current = false
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
