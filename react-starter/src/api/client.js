// 공통 fetch 래퍼
export async function get(url, params = {}) {
  const res = await fetch(`${url}?${new URLSearchParams(params)}`)
  if (!res.ok) throw new Error(`요청 실패: ${res.status}`)
  return res.json()
}
