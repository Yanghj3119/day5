import { useEffect, useState } from 'react'
import { CONTENT_TYPES, fetchJejuList, searchKeyword } from './api/tour'
import PlaceCard from './components/PlaceCard'
import './App.css'

export default function App() {
  const [places, setPlaces] = useState([])
  const [contentTypeId, setContentTypeId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)

    const req = query
      ? searchKeyword({ keyword: query, contentTypeId })
      : fetchJejuList({ contentTypeId })

    req
      .then(({ items }) => !ignore && setPlaces(items))
      .catch((e) => !ignore && setError(e.message))
      .finally(() => !ignore && setLoading(false))

    return () => {
      ignore = true
    }
  }, [contentTypeId, query])

  const handleSubmit = (e) => {
    e.preventDefault()
    setQuery(keyword.trim())
  }

  return (
    <div className="app">
      <header>
        <h1>🍊 제주 관광 정보</h1>
        <form onSubmit={handleSubmit}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력하세요 (예: 성산)"
          />
          <button type="submit">검색</button>
        </form>
        <nav>
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.id}
              className={t.id === contentTypeId ? 'active' : ''}
              onClick={() => setContentTypeId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {loading && <p className="msg">불러오는 중...</p>}
        {error && <p className="msg error">{error}</p>}
        {!loading && !error && places.length === 0 && <p className="msg">결과가 없습니다.</p>}
        <div className="grid">
          {places.map((p) => (
            <PlaceCard key={p.contentid} place={p} />
          ))}
        </div>
      </main>
    </div>
  )
}
