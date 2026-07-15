import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const HomepageSettings = () => {
  const [sections, setSections] = useState({
    heroBanner: true,
    featuredCollections: true,
    featuredCategories: true,
    featuredProducts: true,
  });

  const handleToggle = (key) => {
    setSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Homepage settings saved successfully!');
  };

  const handleManage = (section) => {
    toast.success(`Managing ${section}...`);
  };

  const homepageSections = [
    { key: 'heroBanner', label: 'Hero Banner' },
    { key: 'featuredCollections', label: 'Featured Collections' },
    { key: 'featuredCategories', label: 'Featured Categories' },
    { key: 'featuredProducts', label: 'Featured Products' },
  ];

  return (
    <div className="settings-section">
      <h2 className="section-title">Homepage Settings</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="homepage-sections">
          {homepageSections.map((section) => (
            <div key={section.key} className="homepage-section">
              <div className="section-info">
                <span className="section-label">{section.label}</span>
                <button 
                  type="button"
                  className="manage-btn"
                  onClick={() => handleManage(section.label)}
                >
                  Manage <FiArrowRight size={16} />
                </button>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={sections[section.key]}
                  onChange={() => handleToggle(section.key)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomepageSettings;