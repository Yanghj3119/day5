import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const NAV = [
  ['shop', '쇼핑'],
  ['orders', '주문내역'],
  ['guestbook', '방명록'],
]

export default function Header({ page, setPage, onCartClick }) {
  const { user, displayName, signOut } = useAuth()
  const { count } = useCart()

  return (
    <header className="header">
      <h1 onClick={() => setPage('shop')}>🍊 제주마켓</h1>
      <nav className="nav">
        {NAV.map(([key, label]) => (
          <button key={key} className={page === key ? 'active' : ''} onClick={() => setPage(key)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="user-area">
        {user ? (
          <>
            <span>{displayName}님</span>
            <button onClick={signOut}>로그아웃</button>
          </>
        ) : (
          <button onClick={() => setPage('auth')}>로그인 / 회원가입</button>
        )}
        <button className="cart-btn" onClick={onCartClick}>
          🛒 <span className="badge">{count}</span>
        </button>
      </div>
    </header>
  )
}
