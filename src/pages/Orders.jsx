import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { STATUS_LABEL } from '../data/products'
import { formatPrice } from '../utils'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total_price, status, created_at, order_items(id, quantity, unit_price, line_total, product:products(name, emoji))')
      .order('created_at', { ascending: false })
    if (error) alert(error.message)
    else setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) load()
    else setLoading(false)
  }, [user, load])

  const request = async (orderId, type) => {
    const label = type === 'refund' ? '환불' : '교환'
    const reason = window.prompt(`${label} 사유를 입력해 주세요.`)
    if (reason === null) return
    const { error } = await supabase.rpc('request_after_sale', {
      p_order_id: orderId,
      p_type: type,
      p_reason: reason,
    })
    if (error) return alert(error.message)
    load()
  }

  if (!user) return <p className="empty">로그인 후 확인할 수 있습니다.</p>

  return (
    <main className="container narrow">
      <h2>주문내역</h2>
      {loading && <p className="empty">불러오는 중...</p>}
      {!loading && orders.length === 0 && <p className="empty">주문 내역이 없습니다.</p>}
      {orders.map((o) => (
        <section key={o.id} className="order-card">
          <div className="row">
            <b>주문번호 #{o.id}</b>
            <span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span>
          </div>
          <small>{new Date(o.created_at).toLocaleString('ko-KR')}</small>
          <ul>
            {o.order_items.map((it) => (
              <li key={it.id} className="row">
                <span>
                  {it.product.emoji} {it.product.name} · {formatPrice(it.unit_price)} × {it.quantity}
                </span>
                <span>{formatPrice(it.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="row">
            <strong>총 {formatPrice(o.total_price)}</strong>
            {o.status === 'paid' && (
              <div className="actions">
                <button onClick={() => request(o.id, 'exchange')}>교환 요청</button>
                <button onClick={() => request(o.id, 'refund')}>환불 요청</button>
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  )
}
