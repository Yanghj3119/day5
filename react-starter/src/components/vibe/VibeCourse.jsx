const days = [
  ['1일차', '제주공항 → 애월 해안도로 → 협재해수욕장 → 서쪽 일몰'],
  ['2일차', '천지연폭포 → 주상절리 → 중문 → 서귀포 올레시장'],
  ['3일차', '만장굴 → 성산일출봉 → 우도 → 공항'],
]

export default function VibeCourse() {
  return (
    <section id="course" className="vibe-section">
      <h2>2박 3일 추천 코스</h2>
      <ol className="vibe-timeline">
        {days.map(([d, t]) => (
          <li key={d}>
            <b>{d}</b>
            <span>{t}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
