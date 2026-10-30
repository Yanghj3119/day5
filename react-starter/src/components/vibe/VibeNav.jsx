const links = [
  ['hero', '홈'],
  ['about', '제주 소개'],
  ['spots', '명소'],
  ['food', '맛집'],
  ['stay', '숙소'],
  ['course', '추천 코스'],
  ['season', '계절'],
  ['gallery', '갤러리'],
]

export default function VibeNav() {
  return (
    <nav className="vibe-nav">
      <strong>🍊 JEJU VIBE</strong>
      <ul>
        {links.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
