import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    GraduationCap, 
    ClipboardList, 
    UserPlus,
    Settings,
    X
} from 'lucide-react';
import { useUserDetails } from '../../shared/hooks';
import './navs.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { hasRole, isAdmin, isCoordinador, isProfesor, isPadre, isAlumno } = useUserDetails();

    const menuItems = [
        {
            path: '/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            roles: ['ADMIN_ROLE', 'COORDINADOR_ROLE', 'PROFESOR_ROLE', 'PADRE_ROLE', 'ALUMNO_ROLE']
        },
        {
            path: '/usuarios',
            icon: Users,
            label: 'Usuarios',
            roles: ['ADMIN_ROLE', 'COORDINADOR_ROLE']
        },
        {
            path: '/cursos',
            icon: BookOpen,
            label: 'Cursos',
            roles: ['ADMIN_ROLE', 'COORDINADOR_ROLE', 'PROFESOR_ROLE']
        },
        {
            path: '/materias',
            icon: GraduationCap,
            label: 'Materias',
            roles: ['ADMIN_ROLE', 'COORDINADOR_ROLE', 'PROFESOR_ROLE']
        },
        {
            path: '/calificaciones',
            icon: ClipboardList,
            label: 'Calificaciones',
            roles: ['ADMIN_ROLE', 'COORDINADOR_ROLE', 'PROFESOR_ROLE', 'PADRE_ROLE', 'ALUMNO_ROLE']
        },
        {
            path: '/asignacion',
            icon: UserPlus,
            label: 'Asignación',
            roles: ['ADMIN_ROLE', 'COORDINADOR_ROLE']
        }
    ];

    const filteredMenuItems = menuItems.filter(item => hasRole(item.roles));

    return (
        <>
            {/* Overlay para móvil */}
            <div 
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <GraduationCap size={32} />
                        <span>EduSystem</span>
                    </div>
                    <button className="btn-close-sidebar" onClick={closeSidebar}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul className="sidebar-menu">
                        {filteredMenuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink 
                                    to={item.path} 
                                    className={({ isActive }) => 
                                        `sidebar-link ${isActive ? 'active' : ''}`
                                    }
                                    onClick={closeSidebar}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <NavLink to="/settings" className="sidebar-link" onClick={closeSidebar}>
                        <Settings size={20} />
                        <span>Configuración</span>
                    </NavLink>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;