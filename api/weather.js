// Vercel 서버리스 함수
// 1) 공공데이터포털 기상청 초단기실황(getUltraSrtNcst) 호출
// 2) 저장 가능한 항목만 골라 Supabase(weather_observations)에 upsert
// 3) 최근 저장 기록을 함께 반환
//
// 필요한 환경변수 (Vercel > Settings > Environment Variables)
//   DATA_GO_KR_SERVICE_KEY     공공데이터포털 인증키 (Decoding 키)
//   SUPABASE_URL               https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  Supabase service_role 키 (서버 전용, 절대 VITE_ 등으로 노출 금지)
const ENDPOINT = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst'
const TABLE = 'weather_observations'

const pad = (n) => String(n).padStart(2, '0')

// 초단기실황은 매시 정각 기준 자료가 약 10분 뒤에 제공됩니다.
function baseDateTime() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  if (kst.getUTCMinutes() < 10) kst.setUTCHours(kst.getUTCHours() - 1)
  const y = kst.getUTCFullYear()
  const m = pad(kst.getUTCMonth() + 1)
  const d = pad(kst.getUTCDate())
  const hh = pad(kst.getUTCHours())
  return { base_date: `${y}${m}${d}`, base_time: `${hh}00`, observed_at: `${y}-${m}-${d}T${hh}:00:00+09:00` }
}

// "강수없음", "1.0mm" 같은 값도 숫자로 변환
const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

// DB에 저장할 수 있는 항목만 선택
function toRow({ region, nx, ny, observed_at, values: v }) {
  return {
    region,
    nx,
    ny,
    observed_at,
    temperature: num(v.T1H),
    humidity: Math.round(num(v.REH)),
    rain_1h: num(v.RN1),
    wind_speed: num(v.WSD),
    wind_dir: Math.round(num(v.VEC)),
    wind_u: num(v.UUU),
    wind_v: num(v.VVV),
    precip_type: Math.round(num(v.PTY)),
  }
}

async function saveAndLoadHistory(row) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { saved: false, saveError: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정', history: [] }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  const save = await fetch(`${url}/rest/v1/${TABLE}?on_conflict=nx,ny,observed_at`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  })
  const saveError = save.ok ? null : await save.text()

  const hist = await fetch(
    `${url}/rest/v1/${TABLE}?nx=eq.${row.nx}&ny=eq.${row.ny}&select=observed_at,temperature,humidity,rain_1h,wind_speed&order=observed_at.desc&limit=12`,
    { headers },
  )
  const history = hist.ok ? (await hist.json()).reverse() : []

  return { saved: save.ok, saveError, history }
}

module.exports = async (req, res) => {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) {
    return res.status(500).json({ error: 'DATA_GO_KR_SERVICE_KEY 환경변수가 설정되지 않았습니다.' })
  }

  const nx = Number(req.query.nx)
  const ny = Number(req.query.ny)
  const region = String(req.query.region || '').slice(0, 20)
  if (!Number.isInteger(nx) || !Number.isInteger(ny)) {
    return res.status(400).json({ error: 'nx, ny 격자 좌표가 필요합니다.' })
  }

  const { base_date, base_time, observed_at } = baseDateTime()
  const url = new URL(ENDPOINT)
  Object.entries({ serviceKey, numOfRows: 10, pageNo: 1, dataType: 'JSON', base_date, base_time, nx, ny }).forEach(
    ([k, v]) => url.searchParams.set(k, v),
  )

  try {
    const r = await fetch(url)
    const text = await r.text()
    let json
    try {
      json = JSON.parse(text)
    } catch {
      // 인증키 오류 등은 XML로 응답되는 경우가 있습니다.
      return res.status(502).json({ error: '기상청 응답을 해석할 수 없습니다. 인증키를 확인하세요.', detail: text.slice(0, 200) })
    }

    const header = json.response?.header
    if (header?.resultCode !== '00') {
      return res.status(502).json({ error: header?.resultMsg || '기상청 API 오류', code: header?.resultCode })
    }

    const items = json.response.body?.items?.item ?? []
    const values = Object.fromEntries(items.map((i) => [i.category, i.obsrValue]))

    const db = await saveAndLoadHistory(toRow({ region, nx, ny, observed_at, values }))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ base_date, base_time, nx, ny, region, values, ...db })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
