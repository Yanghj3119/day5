// 한국관광공사 국문 관광정보 서비스_GW
// 서비스 버전에 따라 경로/오퍼레이션 이름이 다를 수 있으니 포털 상세 페이지의 명세를 확인하세요.
// (KorService1 이면 BASE_URL 을 .../KorService1, 오퍼레이션 접미사를 1 로 변경)
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2'
const SERVICE_KEY = import.meta.env.VITE_TOUR_API_KEY

export const JEJU_AREA_CODE = 39

export const CONTENT_TYPES = [
  { id: '', label: '전체' },
  { id: 12, label: '관광지' },
  { id: 14, label: '문화시설' },
  { id: 15, label: '축제/행사' },
  { id: 28, label: '레포츠' },
  { id: 32, label: '숙박' },
  { id: 38, label: '쇼핑' },
  { id: 39, label: '음식점' },
]

async function request(operation, params = {}) {
  const query = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'JejuTour',
    _type: 'json',
    ...params,
  })
  const res = await fetch(`${BASE_URL}/${operation}?${query}`)
  if (!res.ok) throw new Error(`API 오류: ${res.status}`)
  const data = await res.json()
  const body = data.response?.body
  const items = body?.items?.item ?? []
  return {
    items: Array.isArray(items) ? items : [items],
    totalCount: body?.totalCount ?? 0,
  }
}

// 제주 지역 기반 관광정보 목록
export function fetchJejuList({ contentTypeId = '', pageNo = 1, numOfRows = 12 } = {}) {
  return request('areaBasedList2', {
    areaCode: JEJU_AREA_CODE,
    contentTypeId,
    pageNo,
    numOfRows,
  })
}

// 키워드 검색
export function searchKeyword({ keyword, contentTypeId = '', pageNo = 1, numOfRows = 12 }) {
  return request('searchKeyword2', {
    keyword,
    areaCode: JEJU_AREA_CODE,
    contentTypeId,
    pageNo,
    numOfRows,
  })
}
