const facts = [
  ['1,849㎢', '섬 면적'],
  ['한라산 1,947m', '남한 최고봉'],
  ['UNESCO 3관왕', '세계자연유산 등'],
  ['삼다도', '바람·돌·여자'],
]

export default function VibeAbout() {
  return (
    <section id="about" className="vibe-section">
      <h2>제주 소개</h2>
      <p>화산이 만든 섬 제주는 한라산, 오름, 해안 절경과 독특한 돌문화를 품고 있습니다.</p>
      <div className="vibe-facts">
        {facts.map(([v, l]) => (
          <div key={l} className="vibe-fact">
            <b>{v}</b>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
