import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Select from '../Select';
import Button from '../Button';
import { getAllUsers } from '../../services';
import './CursoModal.css';

const CursoModal = ({ isOpen, onClose, curso, onSave }) => {
    const isEditing = !!curso;
    const [coordinadores, setCoordinadores] = useState([]);
    const [profesores, setProfesores] = useState([]);

    const initialFormData = useMemo(() => ({
        nivel: curso?.nivel || '',
        grado: curso?.grado || '',
        seccion: curso?.seccion || '',
        jornada: curso?.jornada || '',
        cicloEscolar: curso?.cicloEscolar || new Date().getFullYear().toString(),
        capacidadMaxima: curso?.capacidadMaxima || 30,
        coordinador: curso?.coordinador?._id || curso?.coordinador || '',
        profesor: curso?.profesor?._id || curso?.profesor || ''
    }), [curso]);

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Cargar coordinadores y profesores disponibles
    useEffect(() => {
        const fetchUsers = async () => {
            const response = await getAllUsers();
            if (!response.error) {
                const users = response.data?.users || response.data || [];
                const coords = users.filter(u => u.role === 'COORDINADOR_ROLE' && u.status);
                const profs = users.filter(u => u.role === 'PROFESOR_ROLE' && u.status);
                setCoordinadores(coords);
                setProfesores(profs);
            }
        };
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    // Reset form cuando se abre el modal
    const resetForm = () => {
        setFormData(initialFormData);
        setErrors({});
    };

    // Llamar resetForm cuando cambia el curso o se abre
    React.useLayoutEffect(() => {
        if (isOpen) {
            resetForm();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, curso]);

    const nivelOptions = [
        { value: 'PREPRIMARIA', label: 'Preprimaria' },
        { value: 'PRIMARIA', label: 'Primaria' },
        { value: 'BASICO', label: 'Básico' }
    ];

    const gradosByNivel = {
        PREPRIMARIA: [
            { value: 'PARVULOS_1', label: 'Párvulos 1' },
            { value: 'PARVULOS_2', label: 'Párvulos 2' },
            { value: 'PARVULOS_3', label: 'Párvulos 3' },
            { value: 'PREPARATORIA', label: 'Preparatoria' }
        ],
        PRIMARIA: [
            { value: 'PRIMERO_PRIMARIA', label: '1° Primaria' },
            { value: 'SEGUNDO_PRIMARIA', label: '2° Primaria' },
            { value: 'TERCERO_PRIMARIA', label: '3° Primaria' },
            { value: 'CUARTO_PRIMARIA', label: '4° Primaria' },
            { value: 'QUINTO_PRIMARIA', label: '5° Primaria' },
            { value: 'SEXTO_PRIMARIA', label: '6° Primaria' }
        ],
        BASICO: [
            { value: 'PRIMERO_BASICO', label: '1° Básico' },
            { value: 'SEGUNDO_BASICO', label: '2° Básico' },
            { value: 'TERCERO_BASICO', label: '3° Básico' }
        ]
    };

    const seccionOptions = [
        { value: 'A', label: 'Sección A' },
        { value: 'B', label: 'Sección B' },
        { value: 'C', label: 'Sección C' }
    ];

    const jornadaOptions = [
        { value: 'MATUTINA', label: 'Matutina' },
        { value: 'VESPERTINA', label: 'Vespertina' }
    ];

    const gradoOptions = formData.nivel ? gradosByNivel[formData.nivel] || [] : [];

    const coordinadorOptions = coordinadores.map(coord => ({
        value: coord.uid || coord._id,
        label: `${coord.name} ${coord.surname || ''} (${coord.username})`
    }));

    const profesorOptions = profesores.map(prof => ({
        value: prof.uid || prof._id,
        label: `${prof.name} ${prof.surname || ''} (${prof.username})`
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si cambia el nivel, limpiar el grado
        if (name === 'nivel') {
            setFormData(prev => ({ ...prev, [name]: value, grado: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nivel) newErrors.nivel = 'El nivel es requerido';
        if (!formData.grado) newErrors.grado = 'El grado es requerido';
        if (!formData.seccion) newErrors.seccion = 'La sección es requerida';
        if (!formData.jornada) newErrors.jornada = 'La jornada es requerida';
        if (!formData.cicloEscolar) newErrors.cicloEscolar = 'El ciclo escolar es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        
        const dataToSend = {
            nivel: formData.nivel,
            grado: formData.grado,
            seccion: formData.seccion,
            jornada: formData.jornada,
            cicloEscolar: formData.cicloEscolar,
            capacidadMaxima: parseInt(formData.capacidadMaxima) || 30
        };

        // Solo agregar coordinador si se seleccionó uno
        if (formData.coordinador) {
            dataToSend.coordinador = formData.coordinador;
        }

        // Solo agregar profesor si se seleccionó uno
        if (formData.profesor) {
            dataToSend.profesor = formData.profesor;
        }

        const success = await onSave(dataToSend);
        setLoading(false);

        if (success) {
            onClose();
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isEditing ? 'Editar Curso' : 'Nuevo Curso'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="curso-form">
                <div className="form-row two-cols">
                    <Select
                        label="Nivel"
                        name="nivel"
                        value={formData.nivel}
                        onChange={handleChange}
                        options={nivelOptions}
                        error={errors.nivel}
                        required
                        disabled={isEditing}
                    />
                    <Select
                        label="Grado"
                        name="grado"
                        value={formData.grado}
                        onChange={handleChange}
                        options={gradoOptions}
                        error={errors.grado}
                        required
                        disabled={!formData.nivel || isEditing}
                    />
                </div>

                <div className="form-row three-cols">
                    <Select
                        label="Sección"
                        name="seccion"
                        value={formData.seccion}
                        onChange={handleChange}
                        options={seccionOptions}
                        error={errors.seccion}
                        required
                    />
                    <Select
                        label="Jornada"
                        name="jornada"
                        value={formData.jornada}
                        onChange={handleChange}
                        options={jornadaOptions}
                        error={errors.jornada}
                        required
                    />
                    <Input
                        label="Ciclo Escolar"
                        name="cicloEscolar"
                        value={formData.cicloEscolar}
                        onChange={handleChange}
                        error={errors.cicloEscolar}
                        placeholder="Ej: 2025"
                        required
                    />
                </div>

                <div className="form-row two-cols">
                    <Input
                        label="Capacidad Máxima"
                        name="capacidadMaxima"
                        type="number"
                        value={formData.capacidadMaxima}
                        onChange={handleChange}
                        min="1"
                        max="50"
                    />
                    <Select
                        label="Coordinador"
                        name="coordinador"
                        value={formData.coordinador}
                        onChange={handleChange}
                        options={coordinadorOptions}
                        placeholder="Seleccionar coordinador (opcional)"
                    />
                </div>

                <div className="form-row two-cols">
                    <Select
                        label="Profesor"
                        name="profesor"
                        value={formData.profesor}
                        onChange={handleChange}
                        options={profesorOptions}
                        placeholder="Seleccionar profesor (opcional)"
                    />
                </div>

                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {isEditing ? 'Guardar Cambios' : 'Crear Curso'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CursoModal;
