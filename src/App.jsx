import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Shop from './pages/Shop'
import Auth from './pages/Auth'
import Orders from './pages/Orders'
import Guestbook from './pages/Guestbook'

function Layout() {
  const [page, setPage] = useState('shop')
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <Header page={page} setPage={setPage} onCartClick={() => setCartOpen(true)} />
      {page === 'shop' && <Shop />}
      {page === 'auth' && <Auth onDone={() => setPage('shop')} />}
      {page === 'orders' && <Orders />}
      {page === 'guestbook' && <Guestbook />}
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrdered={() => setPage('orders')}
      />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout />
      </CartProvider>
    </AuthProvider>
  )
}
