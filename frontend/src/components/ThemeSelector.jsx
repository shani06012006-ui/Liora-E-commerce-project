// frontend/src/components/ThemeSelector.jsx
import { FiSun, FiMoon, FiHeart, FiDroplet, FiAward, FiStar, FiCheck } from 'react-icons/fi';
import './ThemeSelector.css';
 
const ICONS = {
  sun: FiSun,
  moon: FiMoon,
  heart: FiHeart,
  droplet: FiDroplet,
  award: FiAward,
  star: FiStar,
};
 
const ThemeSelector = ({ themes, selectedId, onSelect }) => {
  return (
    <div className="theme-selector-grid">
      {themes.map((theme) => {
        const Icon = ICONS[theme.iconKey] || FiSun;
        const isSelected = theme.id === selectedId;
 
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelect(theme.id)}
            className={`theme-card ${isSelected ? 'theme-card-selected' : ''}`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <span className="theme-card-check">
                <FiCheck size={13} />
              </span>
            )}
 
            <span
              className="theme-card-icon"
              style={{ background: theme.colors[0], color: theme.colors[2] }}
            >
              <Icon size={20} />
            </span>
 
            <span className="theme-card-name">{theme.name}</span>
            <span className="theme-card-desc">{theme.description}</span>
 
            <span className="theme-card-palette">
              {theme.colors.map((color, i) => (
                <span
                  key={i}
                  className="theme-card-swatch"
                  style={{ background: color }}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
};
 
export default ThemeSelector;