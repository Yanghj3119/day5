import { useEffect, useState } from 'react'

export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    fetcher()
      .then((d) => !ignore && setData(d))
      .catch((e) => !ignore && setError(e))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
