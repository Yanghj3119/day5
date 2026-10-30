import ProductCard from './ProductCard'

export default function ProductList({ products }) {
  if (products.length === 0) return <p className="empty">상품이 없습니다.</p>
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
