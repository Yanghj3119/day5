const spots = [
  { name: '성산일출봉', area: '동부', desc: '해돋이 명소, 세계자연유산' },
  { name: '한라산', area: '중앙', desc: '백록담까지 이어지는 등반 코스' },
  { name: '협재해수욕장', area: '서부', desc: '에메랄드빛 바다와 비양도 전망' },
  { name: '천지연폭포', area: '남부', desc: '서귀포 대표 폭포' },
  { name: '우도', area: '동부', desc: '땅콩아이스크림과 자전거 일주' },
  { name: '만장굴', area: '동부', desc: '세계적인 용암동굴' },
]

export default function VibeSpots() {
  return (
    <section id="spots" className="vibe-section alt">
      <h2>대표 명소</h2>
      <div className="vibe-grid">
        {spots.map((s) => (
          <article key={s.name} className="vibe-card">
            <span className="tag">{s.area}</span>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
