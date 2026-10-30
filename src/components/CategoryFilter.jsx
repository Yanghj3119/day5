import { CATEGORIES } from '../data/products'

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="filter">
      {CATEGORIES.map((c) => (
        <button key={c} className={c === value ? 'active' : ''} onClick={() => onChange(c)}>
          {c}
        </button>
      ))}
    </div>
  )
}
