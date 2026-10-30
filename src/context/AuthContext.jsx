import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUp = (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } })

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0]

  return (
    <AuthContext.Provider value={{ user, ready, displayName, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
