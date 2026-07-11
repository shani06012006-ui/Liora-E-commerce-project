import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = ({ children, title, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f7f5', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>
      <AdminSidebar isOpen={sidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <AdminTopbar
          title={title}
          actions={actions}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;