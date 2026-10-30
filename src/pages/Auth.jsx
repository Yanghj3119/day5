import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Auth({ onDone }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) setMsg(error.message)
      else onDone()
    } else {
      const { data, error } = await signUp(form.email, form.password, form.name)
      if (error) setMsg(error.message)
      else if (data.session) onDone()
      else setMsg('가입 완료! 이메일 인증이 필요한 경우 메일함을 확인해 주세요.')
    }
    setBusy(false)
  }

  return (
    <main className="container narrow">
      <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>
      <form className="form" onSubmit={submit}>
        {mode === 'signup' && (
          <input placeholder="이름(닉네임)" value={form.name} onChange={set('name')} required />
        )}
        <input type="email" placeholder="이메일" value={form.email} onChange={set('email')} required />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          minLength={6}
          value={form.password}
          onChange={set('password')}
          required
        />
        <button className="order" disabled={busy}>
          {mode === 'login' ? '로그인' : '가입하기'}
        </button>
      </form>
      {msg && <p className="empty error">{msg}</p>}
      <p className="switch">
        {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); setMsg('') }}>
          {mode === 'login' ? '회원가입' : '로그인'}
        </a>
      </p>
    </main>
  )
}
