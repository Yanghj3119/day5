const stays = [
  { type: '호텔·리조트', area: '중문', price: '150,000원~' },
  { type: '감성 펜션', area: '애월', price: '90,000원~' },
  { type: '게스트하우스', area: '제주시', price: '30,000원~' },
  { type: '독채 돌집', area: '성산', price: '120,000원~' },
]

export default function VibeStay() {
  return (
    <section id="stay" className="vibe-section alt">
      <h2>숙소</h2>
      <div className="vibe-grid">
        {stays.map((s) => (
          <article key={s.type} className="vibe-card">
            <h3>{s.type}</h3>
            <p>{s.area}</p>
            <strong>{s.price}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
