import './CategoryTag.css'

const CATEGORY_COLORS = {
  trabajo: '#3b82f6',
  personal: '#10b981',
  salud: '#ef4444',
  educacion: '#f59e0b',
  entretenimiento: '#8b5cf6',
  otro: '#6b7280'
}

export default function CategoryTag({ category, onClick, removable, onRemove }) {
  const color = CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.otro

  return (
    <span 
      className={`category-tag ${onClick ? 'clickable' : ''} ${removable ? 'removable' : ''}`}
      style={{ 
        '--tag-color': color,
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}40`
      }}
      onClick={onClick}
    >
      <span className="tag-text">{category}</span>
      {removable && (
        <button 
          className="tag-remove" 
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
        >
          ✕
        </button>
      )}
    </span>
  )
}

export function CategorySelect({ value, onChange, multiple = false }) {
  const categories = Object.keys(CATEGORY_COLORS)
  const selectedCategories = multiple ? (value || []) : [value].filter(Boolean)

  const handleToggle = (cat) => {
    if (multiple) {
      const newValue = selectedCategories.includes(cat)
        ? selectedCategories.filter(c => c !== cat)
        : [...selectedCategories, cat]
      onChange(newValue)
    } else {
      onChange(cat === value ? '' : cat)
    }
  }

  return (
    <div className="category-select">
      <div className="category-options">
        {categories.map(cat => (
          <CategoryTag
            key={cat}
            category={cat}
            onClick={() => handleToggle(cat)}
            removable={selectedCategories.includes(cat)}
            onRemove={() => handleToggle(cat)}
          />
        ))}
      </div>
    </div>
  )
}

