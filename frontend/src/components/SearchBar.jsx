import { useState } from 'react'
import './SearchBar.css'

export default function SearchBar({ onSearch, placeholder = "Buscar...", className = '' }) {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch(newValue)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-icon">🔍</div>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {value && (
        <button className="search-clear" onClick={handleClear} type="button">
          ✕
        </button>
      )}
    </div>
  )
}

