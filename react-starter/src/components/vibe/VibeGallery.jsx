const colors = ['#4fb3bf', '#ff9f43', '#6ab04c', '#a29bfe', '#ee5a6f', '#54a0ff']

export default function VibeGallery() {
  return (
    <section id="gallery" className="vibe-section">
      <h2>갤러리</h2>
      <p>이미지는 assets 폴더에 추가해 교체하세요.</p>
      <div className="vibe-gallery">
        {colors.map((c, i) => (
          <div key={c} style={{ background: c }}>
            Photo {i + 1}
          </div>
        ))}
      </div>
    </section>
  )
}
