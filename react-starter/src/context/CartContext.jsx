import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  const refresh = useCallback(async () => {
    if (!user) return setItems([])
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, product:products(id, name, price, emoji)')
      .order('created_at')
    if (error) return console.error(error)
    setItems(data)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = async (productId) => {
    if (!user) return alert('로그인이 필요합니다.')
    const found = items.find((i) => i.product.id === productId)
    const { error } = found
      ? await supabase.from('cart_items').update({ quantity: found.quantity + 1 }).eq('id', found.id)
      : await supabase.from('cart_items').insert({ product_id: productId, quantity: 1 })
    if (error) return alert(error.message)
    refresh()
  }

  const setQty = async (item, qty) => {
    const { error } =
      qty <= 0
        ? await supabase.from('cart_items').delete().eq('id', item.id)
        : await supabase.from('cart_items').update({ quantity: qty }).eq('id', item.id)
    if (error) return alert(error.message)
    refresh()
  }

  const remove = (item) => setQty(item, 0)

  // 표시용 합계. 실제 주문 금액은 DB(place_order)가 수량 x 가격으로 다시 계산합니다.
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.quantity * i.product.price, 0)

  return (
    <CartContext.Provider value={{ items, count, total, add, setQty, remove, refresh }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
