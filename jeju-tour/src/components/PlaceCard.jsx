export default function PlaceCard({ place }) {
  return (
    <article className="card">
      {place.firstimage ? (
        <img src={place.firstimage} alt={place.title} loading="lazy" />
      ) : (
        <div className="no-image">이미지 없음</div>
      )}
      <div className="card-body">
        <h3>{place.title}</h3>
        <p>{place.addr1}</p>
      </div>
    </article>
  )
}
