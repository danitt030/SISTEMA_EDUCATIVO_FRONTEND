import { DashboardPage } from './pages/dashboard';
import { AuthPage } from './pages/auth';
import { UserPage } from './pages/user';
import { CursoPage } from './pages/cursos';
import { MateriaPage } from './pages/materias';
import { CalificacionPage } from './pages/calificaciones';
import { AsignacionPage } from './pages/asignacion';
import { SettingsPage } from './pages/settings';
import NotFoundPage from './pages/notFoundPage.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';

export const routes = [
    // Ruta pública
    { path: '/auth', element: <AuthPage /> },

    // Rutas protegidas con layout
    { 
        path: '/dashboard', 
        element: <ProtectedLayout><DashboardPage /></ProtectedLayout> 
    },
    { 
        path: '/usuarios', 
        element: <ProtectedLayout roles={['ADMIN_ROLE', 'COORDINADOR_ROLE']}><UserPage /></ProtectedLayout> 
    },
    { 
        path: '/cursos', 
        element: <ProtectedLayout roles={['ADMIN_ROLE', 'COORDINADOR_ROLE', 'PROFESOR_ROLE']}><CursoPage /></ProtectedLayout> 
    },
    { 
        path: '/materias', 
        element: <ProtectedLayout roles={['ADMIN_ROLE', 'COORDINADOR_ROLE', 'PROFESOR_ROLE']}><MateriaPage /></ProtectedLayout> 
    },
    { 
        path: '/calificaciones', 
        element: <ProtectedLayout><CalificacionPage /></ProtectedLayout> 
    },
    { 
        path: '/asignacion', 
        element: <ProtectedLayout roles={['ADMIN_ROLE', 'COORDINADOR_ROLE']}><AsignacionPage /></ProtectedLayout> 
    },
    { 
        path: '/', 
        element: <ProtectedLayout><DashboardPage /></ProtectedLayout> 
    },
    { 
        path: '/settings', 
        element: <ProtectedLayout><SettingsPage /></ProtectedLayout> 
    },
    { path: '*', element: <NotFoundPage /> }
];