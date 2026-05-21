import './Sidebar.css';


export function Sidebar() {
  const buttons = [
    { id: 'search', icon: '🔍', title: 'Search' },
    { id: 'settings', icon: '⚙️', title: 'Settings' },
    { id: 'home', icon: '🏠', title: 'Home' },
    { id: 'add', icon: '➕', title: 'Add' },
    { id: 'profile', icon: '👤', title: 'Profile' },
  ];



  return (
    <div className="sidebar">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          className="sidebar-btn"
          title={btn.title}
          onClick={() => {}}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
