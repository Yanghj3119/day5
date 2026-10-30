import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Post({ post, user, reload }) {
  const [text, setText] = useState('')
  const liked = post.likes.some((l) => l.user_id === user?.id)

  const needLogin = () => {
    if (!user) alert('로그인이 필요합니다.')
    return !user
  }

  const toggleLike = async () => {
    if (needLogin()) return
    const q = supabase.from('likes')
    const { error } = liked
      ? await q.delete().eq('guestbook_id', post.id).eq('user_id', user.id)
      : await q.insert({ guestbook_id: post.id })
    if (error) return alert(error.message)
    reload()
  }

  const addComment = async (e) => {
    e.preventDefault()
    if (needLogin() || !text.trim()) return
    const { error } = await supabase.from('comments').insert({ guestbook_id: post.id, content: text.trim() })
    if (error) return alert(error.message)
    setText('')
    reload()
  }

  const del = async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return alert(error.message)
    reload()
  }

  return (
    <article className="post">
      <div className="row">
        <b>{post.profile?.name || '익명'}</b>
        <small>{new Date(post.created_at).toLocaleString('ko-KR')}</small>
      </div>
      <p>{post.content}</p>
      <div className="actions">
        <button className={liked ? 'active' : ''} onClick={toggleLike}>
          {liked ? '❤️' : '🤍'} {post.likes.length}
        </button>
        {post.user_id === user?.id && <button onClick={() => del('guestbook', post.id)}>삭제</button>}
      </div>

      <ul className="comments">
        {post.comments.map((c) => (
          <li key={c.id} className="row">
            <span>
              <b>{c.profile?.name || '익명'}</b> {c.content}
            </span>
            {c.user_id === user?.id && <button onClick={() => del('comments', c.id)}>삭제</button>}
          </li>
        ))}
      </ul>
      <form className="comment-form" onSubmit={addComment}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="댓글 달기" maxLength={300} />
        <button>등록</button>
      </form>
    </article>
  )
}

export default function Guestbook() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('guestbook')
      .select('id, user_id, content, created_at, profile:profiles(name), likes(user_id), comments(id, user_id, content, created_at, profile:profiles(name))')
      .order('created_at', { ascending: false })
      .order('created_at', { referencedTable: 'comments', ascending: true })
    if (error) alert(error.message)
    else setPosts(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = async (e) => {
    e.preventDefault()
    if (!user) return alert('로그인이 필요합니다.')
    if (!text.trim()) return
    const { error } = await supabase.from('guestbook').insert({ content: text.trim() })
    if (error) return alert(error.message)
    setText('')
    load()
  }

  return (
    <main className="container narrow">
      <h2>방명록</h2>
      <form className="form" onSubmit={submit}>
        <textarea
          rows={3}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? '제주마켓에 남기고 싶은 말을 적어주세요' : '로그인 후 작성할 수 있습니다'}
        />
        <button className="order">남기기</button>
      </form>
      {posts.length === 0 && <p className="empty">첫 방명록을 남겨보세요.</p>}
      {posts.map((p) => (
        <Post key={p.id} post={p} user={user} reload={load} />
      ))}
    </main>
  )
}
