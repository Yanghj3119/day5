const foods = [
  ['흑돼지구이', '쫄깃한 식감의 제주 대표 음식'],
  ['고기국수', '진한 돼지 육수 국수'],
  ['갈치조림', '두툼한 제주 은갈치'],
  ['성게미역국', '바다 향 가득한 보양식'],
  ['한라봉 에이드', '상큼한 감귤류 음료'],
]

export default function VibeFood() {
  return (
    <section id="food" className="vibe-section">
      <h2>제주 맛집 · 먹거리</h2>
      <ul className="vibe-list">
        {foods.map(([n, d]) => (
          <li key={n}>
            <b>{n}</b>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
