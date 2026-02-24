import { AdminSection } from '../types';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const navItems: Array<{ key: AdminSection; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'requests', label: 'Scrap Requests' },
  { key: 'support', label: 'Support Chat' },
];

function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/login', { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">Scrappy Admin</div>

      <nav className="admin-nav" aria-label="Admin sections">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`admin-nav-item ${activeSection === item.key ? 'active' : ''}`}
            onClick={() => onSectionChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <button
          type="button"
          className="admin-nav-item"
          onClick={handleLogout}
          aria-label="Logout from admin panel"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
