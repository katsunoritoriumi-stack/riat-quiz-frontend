// 事前生成したクイズプール（public/quiz_pool.json）を読み込み、
// カテゴリ×難易度に応じてブラウザ側でランダム出題する。
// 実行時にバックエンド/APIを呼ばない（完全静的）。

// プールを1回だけ取得する。形式: { "カテゴリ|難易度": [ {question, choices, answer_index, explanation, source_urls, source_titles}, ... ] }
export async function loadPool() {
  const res = await fetch(`${import.meta.env.BASE_URL}quiz_pool.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error('クイズデータの読み込みに失敗しました')
  return res.json()
}

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// server.py の _pick_quiz と同じフォールバック方針を移植:
// 完全一致 → 同カテゴリの別難易度 → 同難易度の全カテゴリ → 全体
export function pickQuiz(pool, category, difficulty) {
  if (!pool) return null
  const key = `${category}|${difficulty}`
  if (pool[key] && pool[key].length) return randomOf(pool[key])

  // フォールバック1: 同カテゴリの別難易度
  if (category) {
    const cand = []
    for (const k of Object.keys(pool)) {
      if (k.startsWith(category + '|')) cand.push(...pool[k])
    }
    if (cand.length) return randomOf(cand)
  }

  // フォールバック2: 同難易度の全カテゴリ（カテゴリ未指定/おまかせ時）
  const sameDiff = []
  for (const k of Object.keys(pool)) {
    if (k.endsWith('|' + difficulty)) sameDiff.push(...pool[k])
  }
  if (sameDiff.length) return randomOf(sameDiff)

  // フォールバック3: 全問題から
  const all = []
  for (const k of Object.keys(pool)) all.push(...pool[k])
  return all.length ? randomOf(all) : null
}
