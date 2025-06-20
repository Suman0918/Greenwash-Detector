import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiFileText, FiChevronLeft } from 'react-icons/fi';
import { RiPlantLine } from 'react-icons/ri';
import logo from '../assets/logo.png';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        {!collapsed && <img src={logo} alt='Eco Inspector' className='logo' />}
        {collapsed && <RiPlantLine size={24} className="logo-icon" />}
        <button 
          className="collapse-btn" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FiChevronLeft />
        </button>
      </div>
      
      <nav>
        <NavLink to='/' className={({isActive}) => isActive ? 'active' : ''}>
          <FiHome size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to='/manual' className={({isActive}) => isActive ? 'active' : ''}>
          <FiSearch size={20} />
          <span>Manual Analysis</span>
        </NavLink>
        <NavLink to='/reports' className={({isActive}) => isActive ? 'active' : ''}>
          <FiFileText size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>
      
      {!collapsed && (
        <div className="sidebar-footer">
          <p>© 2025 Eco Inspector</p>
          <p>Making fashion sustainable</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;