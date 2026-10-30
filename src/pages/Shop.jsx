import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Banner from '../components/Banner'
import CategoryFilter from '../components/CategoryFilter'
import ProductList from '../components/ProductList'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('전체')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProducts(data)
        setLoading(false)
      })
  }, [])

  const visible = category === '전체' ? products : products.filter((p) => p.category === category)

  return (
    <>
      <Banner />
      <main className="container">
        <CategoryFilter value={category} onChange={setCategory} />
        {loading && <p className="empty">불러오는 중...</p>}
        {error && <p className="empty error">{error}</p>}
        {!loading && !error && <ProductList products={visible} />}
      </main>
    </>
  )
}
