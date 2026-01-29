import './SearchInput.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="タスクを検索..."
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
}
