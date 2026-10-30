import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const soldOut = product.stock <= 0

  return (
    <article className="product">
      <div className="thumb">{product.emoji}</div>
      <span className="cat">{product.category}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="row">
        <strong>{formatPrice(product.price)}</strong>
        <button disabled={soldOut} onClick={() => add(product.id)}>
          {soldOut ? '품절' : '담기'}
        </button>
      </div>
    </article>
  )
}
