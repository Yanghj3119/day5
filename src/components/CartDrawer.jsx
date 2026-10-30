import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils'

export default function CartDrawer({ open, onClose, onOrdered }) {
  const { items, total, setQty, remove, refresh } = useCart()
  const [busy, setBusy] = useState(false)

  const handleOrder = async () => {
    setBusy(true)
    const { error } = await supabase.rpc('place_order')
    setBusy(false)
    if (error) return alert(error.message)
    await refresh()
    onClose()
    onOrdered()
  }

  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <h2>장바구니</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <p className="empty">담긴 상품이 없습니다.</p>
        ) : (
          <ul className="cart-list">
            {items.map((i) => (
              <li key={i.id}>
                <span>
                  {i.product.emoji} {i.product.name}
                </span>
                <span>{formatPrice(i.product.price * i.quantity)}</span>
                <div className="qty">
                  <button onClick={() => setQty(i, i.quantity - 1)}>-</button>
                  <b>{i.quantity}</b>
                  <button onClick={() => setQty(i, i.quantity + 1)}>+</button>
                </div>
                <button onClick={() => remove(i)}>삭제</button>
              </li>
            ))}
          </ul>
        )}

        <div className="drawer-foot">
          <div className="row">
            <span>합계</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button className="order" disabled={items.length === 0 || busy} onClick={handleOrder}>
            {busy ? '처리중...' : '구매하기'}
          </button>
        </div>
      </aside>
    </>
  )
}
