// 事前生成したクイズプール（public/quiz_pool.json）を読み込み、
// カテゴリ×難易度に応じてブラウザ側で出題する。実行時にAPIを呼ばない（完全静的）。

// プールを1回だけ取得する。形式: { "カテゴリ|難易度": [ {question, choices, answer_index, explanation, source_urls, source_titles}, ... ] }
export async function loadPool() {
  const res = await fetch(`${import.meta.env.BASE_URL}quiz_pool.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error('クイズデータの読み込みに失敗しました')
  return res.json()
}

function shuffle(arr) {
  const r = arr.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// server.py の _pick_quiz と同じフォールバック方針:
// 完全一致 → 同カテゴリの別難易度 → 同難易度の全カテゴリ → 全体
function candidatesFor(pool, category, difficulty) {
  const key = `${category}|${difficulty}`
  if (pool[key] && pool[key].length) return pool[key]

  if (category) {
    const c = []
    for (const k of Object.keys(pool)) if (k.startsWith(category + '|')) c.push(...pool[k])
    if (c.length) return c
  }

  const sameDiff = []
  for (const k of Object.keys(pool)) if (k.endsWith('|' + difficulty)) sameDiff.push(...pool[k])
  if (sameDiff.length) return sameDiff

  const all = []
  for (const k of Object.keys(pool)) all.push(...pool[k])
  return all
}

// カテゴリ×難易度から重複なしで n 問を選ぶ（1セット分）
export function pickQuizSet(pool, category, difficulty, n = 10) {
  if (!pool) return []
  const cands = candidatesFor(pool, category, difficulty)
  return shuffle(cands).slice(0, n)
}
