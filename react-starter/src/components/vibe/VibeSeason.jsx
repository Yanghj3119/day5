const seasons = [
  ['🌸 봄', '유채꽃, 벚꽃 축제'],
  ['🌊 여름', '해수욕, 수국'],
  ['🍂 가을', '억새, 오름 트레킹'],
  ['❄️ 겨울', '한라산 눈꽃, 동백'],
]

export default function VibeSeason() {
  return (
    <section id="season" className="vibe-section alt">
      <h2>계절별 제주</h2>
      <div className="vibe-grid">
        {seasons.map(([t, d]) => (
          <article key={t} className="vibe-card">
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
