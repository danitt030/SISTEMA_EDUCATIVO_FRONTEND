import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, ClipboardList, UserPlus, LayoutDashboard, TrendingUp, Calendar, Award, FileText } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { useUser, useCurso, useMateria, useAsignacion } from '../../shared/hooks';
import { getCalificacionesPorEstudiante } from '../../services';
import Loader from '../../components/Loader';
import './dashboardPage.css';

// ==================== DASHBOARD ADMIN/COORDINADOR ====================
const AdminDashboard = ({ users, cursos, materias, asignaciones }) => {
    const alumnos = users.filter(u => u.role === 'ALUMNO_ROLE');
    const profesores = users.filter(u => u.role === 'PROFESOR_ROLE');

    const stats = [
        { label: 'Usuarios', value: users.length, icon: Users, color: 'primary' },
        { label: 'Cursos', value: cursos.length, icon: BookOpen, color: 'success' },
        { label: 'Materias', value: materias.length, icon: GraduationCap, color: 'warning' },
        { label: 'Estudiantes', value: alumnos.length, icon: UserPlus, color: 'info' },
    ];

    const quickActions = [
        { label: 'Usuarios', icon: Users, path: '/usuarios' },
        { label: 'Cursos', icon: BookOpen, path: '/cursos' },
        { label: 'Materias', icon: GraduationCap, path: '/materias' },
        { label: 'Calificaciones', icon: ClipboardList, path: '/calificaciones' },
        { label: 'Inscripciones', icon: UserPlus, path: '/asignacion' },
    ];

    return (
        <>
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className={`stat-icon ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-number">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="quick-actions">
                <h2 className="section-title">
                    <LayoutDashboard size={24} />
                    Accesos Rápidos
                </h2>
                <div className="actions-grid">
                    {quickActions.map((action, index) => (
                        <Link key={index} to={action.path} className="action-btn">
                            <action.icon size={28} />
                            <span>{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="recent-section">
                <h2 className="section-title">
                    <TrendingUp size={24} />
                    Resumen del Sistema
                </h2>
                <div className="summary-grid">
                    <div className="summary-card">
                        <h3>Profesores Activos</h3>
                        <div className="summary-value">{profesores.length}</div>
                    </div>
                    <div className="summary-card">
                        <h3>Inscripciones</h3>
                        <div className="summary-value">{asignaciones.length}</div>
                    </div>
                    <div className="summary-card">
                        <h3>Cursos Activos</h3>
                        <div className="summary-value">{cursos.filter(c => c.estado).length}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ==================== DASHBOARD PROFESOR ====================
const ProfesorDashboard = () => {
    const quickActions = [
        { label: 'Materias', icon: GraduationCap, path: '/materias' },
        { label: 'Cursos', icon: BookOpen, path: '/cursos' },
        { label: 'Calificaciones', icon: ClipboardList, path: '/calificaciones' },
    ];

    return (
        <>
            <div className="info-card welcome-card">
                <div className="info-icon">
                    <GraduationCap size={40} />
                </div>
                <div className="info-content">
                    <h3>Panel de Profesor</h3>
                    <p>Gestiona tus materias y calificaciones de estudiantes</p>
                </div>
            </div>

            <div className="quick-actions">
                <h2 className="section-title">
                    <LayoutDashboard size={24} />
                    Accesos Rápidos
                </h2>
                <div className="actions-grid">
                    {quickActions.map((action, index) => (
                        <Link key={index} to={action.path} className="action-btn">
                            <action.icon size={28} />
                            <span>{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

// ==================== DASHBOARD ALUMNO ====================
const AlumnoDashboard = ({ user }) => {
    const [misCalificaciones, setMisCalificaciones] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMisCalificaciones = async () => {
            const ciclo = new Date().getFullYear().toString();
            const response = await getCalificacionesPorEstudiante(user.uid, ciclo);
            if (!response.error && response.data) {
                // El backend devuelve { calificaciones: [...], resumen: {...} }
                const califData = response.data?.calificaciones || [];
                setMisCalificaciones(califData);
                setResumen(response.data?.resumen || null);
            }
            setLoading(false);
        };
        if (user?.uid) {
            fetchMisCalificaciones();
        }
    }, [user?.uid]);

    // Usar el resumen del backend si está disponible
    const promedio = resumen?.promedioGeneral || 0;
    const aprobadas = resumen?.materiasAprobadas || 0;
    const totalMaterias = resumen?.totalMaterias || misCalificaciones.length;

    // Extraer las últimas calificaciones con notas reales
    const ultimasCalificaciones = misCalificaciones
        .filter(mat => mat.bimestre1 || mat.bimestre2 || mat.bimestre3 || mat.bimestre4)
        .flatMap(mat => {
            const notas = [];
            if (mat.bimestre1) notas.push({ materia: mat.materia, bimestre: 1, nota: mat.bimestre1.total });
            if (mat.bimestre2) notas.push({ materia: mat.materia, bimestre: 2, nota: mat.bimestre2.total });
            if (mat.bimestre3) notas.push({ materia: mat.materia, bimestre: 3, nota: mat.bimestre3.total });
            if (mat.bimestre4) notas.push({ materia: mat.materia, bimestre: 4, nota: mat.bimestre4.total });
            return notas;
        })
        .slice(0, 5);

    return (
        <>
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon primary">
                        <ClipboardList size={24} />
                    </div>
                    <div className="stat-number">{totalMaterias}</div>
                    <div className="stat-label">Materias</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon success">
                        <Award size={24} />
                    </div>
                    <div className="stat-number">{promedio}</div>
                    <div className="stat-label">Promedio</div>
                </div>
                <div className="stat-card info">
                    <div className="stat-icon info">
                        <FileText size={24} />
                    </div>
                    <div className="stat-number">{aprobadas}</div>
                    <div className="stat-label">Aprobadas</div>
                </div>
            </div>

            <div className="quick-actions">
                <h2 className="section-title">
                    <LayoutDashboard size={24} />
                    Accesos Rápidos
                </h2>
                <div className="actions-grid">
                    <Link to="/calificaciones" className="action-btn">
                        <ClipboardList size={28} />
                        <span>Mis Calificaciones</span>
                    </Link>
                </div>
            </div>

            {ultimasCalificaciones.length > 0 && (
                <div className="recent-section">
                    <h2 className="section-title">
                        <TrendingUp size={24} />
                        Últimas Calificaciones
                    </h2>
                    <div className="calificaciones-list">
                        {ultimasCalificaciones.map((cal, index) => (
                            <div key={index} className="calificacion-item">
                                <div className="cal-info">
                                    <span className="cal-materia">{cal.materia}</span>
                                    <span className="cal-bimestre">Bimestre {cal.bimestre}</span>
                                </div>
                                <span className={`cal-nota ${cal.nota >= 60 ? 'aprobado' : 'reprobado'}`}>
                                    {cal.nota}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

// ==================== DASHBOARD PADRE ====================
const PadreDashboard = () => {
    return (
        <>
            <div className="info-card welcome-card">
                <div className="info-icon">
                    <Users size={40} />
                </div>
                <div className="info-content">
                    <h3>Panel de Padre de Familia</h3>
                    <p>Consulta las calificaciones de tus hijos</p>
                </div>
            </div>

            <div className="quick-actions">
                <h2 className="section-title">
                    <LayoutDashboard size={24} />
                    Accesos Rápidos
                </h2>
                <div className="actions-grid">
                    <Link to="/calificaciones" className="action-btn">
                        <ClipboardList size={28} />
                        <span>Calificaciones</span>
                    </Link>
                </div>
            </div>
        </>
    );
};

// ==================== COMPONENTE PRINCIPAL ====================
const DashboardPage = () => {
    const { user } = useAuth();
    const { users, fetchUsers } = useUser();
    const { cursos, fetchCursos } = useCurso();
    const { materias, fetchMaterias } = useMateria();
    const { asignaciones, fetchAsignaciones } = useAsignacion();
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = user?.role === 'ADMIN_ROLE' || user?.role === 'COORDINADOR_ROLE';
    const isProfesor = user?.role === 'PROFESOR_ROLE';
    const isAlumno = user?.role === 'ALUMNO_ROLE';
    const isPadre = user?.role === 'PADRE_ROLE';

    useEffect(() => {
        const loadData = async () => {
            if (isAdmin) {
                await Promise.all([
                    fetchUsers(),
                    fetchCursos(),
                    fetchMaterias(),
                    fetchAsignaciones()
                ]);
            }
            setIsLoading(false);
        };
        loadData();
    }, [isAdmin, fetchUsers, fetchCursos, fetchMaterias, fetchAsignaciones]);

    const getRoleLabel = (role) => {
        const roles = {
            'ADMIN_ROLE': 'Administrador',
            'COORDINADOR_ROLE': 'Coordinador',
            'PROFESOR_ROLE': 'Profesor',
            'PADRE_ROLE': 'Padre de Familia',
            'ALUMNO_ROLE': 'Alumno'
        };
        return roles[role] || role;
    };

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <Loader text="Cargando dashboard..." size="lg" />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1 className="welcome-text">
                            👋 Bienvenido, <span>{user?.name || 'Usuario'}</span>
                        </h1>
                        <p className="role-text">{getRoleLabel(user?.role)}</p>
                    </div>
                    <p className="date-text">
                        {new Date().toLocaleDateString('es-GT', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>

                {/* Renderizar dashboard según rol */}
                {isAdmin && (
                    <AdminDashboard 
                        users={users} 
                        cursos={cursos} 
                        materias={materias} 
                        asignaciones={asignaciones} 
                    />
                )}
                {isProfesor && <ProfesorDashboard />}
                {isAlumno && <AlumnoDashboard user={user} />}
                {isPadre && <PadreDashboard />}
            </div>
        </div>
    );
};

export default DashboardPage;