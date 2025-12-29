import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Select from '../Select';
import Button from '../Button';
import './AsignacionModal.css';

const AsignacionModal = ({ isOpen, onClose, asignacion, estudiantes = [], encargados = [], cursos = [], onSave }) => {
    const getInitialFormData = () => ({
        estudiante: asignacion?.estudiante?._id || asignacion?.estudiante || '',
        curso: asignacion?.curso?._id || asignacion?.curso || '',
        encargado: asignacion?.encargado?._id || asignacion?.encargado || '',
        cicloEscolar: asignacion?.cicloEscolar || new Date().getFullYear().toString(),
        becado: asignacion?.becado || false,
        observaciones: asignacion?.observaciones || ''
    });

    const [formData, setFormData] = useState(getInitialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const prevIsOpenRef = useRef(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // Solo resetear cuando el modal se abre (transición de cerrado a abierto)
        if (isOpen && !prevIsOpenRef.current) {
            setFormData(getInitialFormData());
            setErrors({});
        }
        prevIsOpenRef.current = isOpen;
    });

    // Función para formatear el grado
    const formatGrado = (grado) => {
        const gradoMap = {
            'PARVULOS_1': 'Párvulos 1',
            'PARVULOS_2': 'Párvulos 2',
            'PARVULOS_3': 'Párvulos 3',
            'PREPARATORIA': 'Preparatoria',
            'PRIMERO_PRIMARIA': '1° Primaria',
            'SEGUNDO_PRIMARIA': '2° Primaria',
            'TERCERO_PRIMARIA': '3° Primaria',
            'CUARTO_PRIMARIA': '4° Primaria',
            'QUINTO_PRIMARIA': '5° Primaria',
            'SEXTO_PRIMARIA': '6° Primaria',
            'PRIMERO_BASICO': '1° Básico',
            'SEGUNDO_BASICO': '2° Básico',
            'TERCERO_BASICO': '3° Básico'
        };
        return gradoMap[grado] || grado;
    };

    const estudianteOptions = estudiantes.filter(e => e.status !== false).map(est => ({
        value: est.uid,
        label: `${est.name || ''} ${est.surname || ''}`.trim() || est.username
    }));

    const encargadoOptions = encargados.filter(e => e.status !== false).map(enc => ({
        value: enc.uid,
        label: `${enc.name || ''} ${enc.surname || ''}`.trim() || enc.username
    }));

    const cursoOptions = cursos.filter(c => c.status !== false).map(curso => ({
        value: curso.cid,
        label: `${formatGrado(curso.grado)} "${curso.seccion}" - ${curso.jornada || ''}`
    }));

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.estudiante) newErrors.estudiante = 'El estudiante es requerido';
        if (!formData.curso) newErrors.curso = 'El curso es requerido';
        if (!formData.encargado) newErrors.encargado = 'El encargado es requerido';
        if (!formData.cicloEscolar) newErrors.cicloEscolar = 'El ciclo escolar es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const success = await onSave(formData);
        setLoading(false);

        if (success) {
            onClose();
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={asignacion ? 'Editar Inscripción' : 'Nueva Inscripción'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="asignacion-form">
                <div className="form-row">
                    <Select
                        label="Estudiante"
                        name="estudiante"
                        value={formData.estudiante}
                        onChange={handleChange}
                        options={estudianteOptions}
                        error={errors.estudiante}
                        placeholder="Seleccionar estudiante..."
                        required
                        disabled={!!asignacion}
                    />
                </div>

                <div className="form-row">
                    <Select
                        label="Curso"
                        name="curso"
                        value={formData.curso}
                        onChange={handleChange}
                        options={cursoOptions}
                        error={errors.curso}
                        placeholder="Seleccionar curso..."
                        required
                    />
                </div>

                <div className="form-row">
                    <Select
                        label="Encargado (Padre/Madre)"
                        name="encargado"
                        value={formData.encargado}
                        onChange={handleChange}
                        options={encargadoOptions}
                        error={errors.encargado}
                        placeholder="Seleccionar encargado..."
                        required
                    />
                </div>

                <div className="form-row two-cols">
                    <Input
                        label="Ciclo Escolar"
                        name="cicloEscolar"
                        value={formData.cicloEscolar}
                        onChange={handleChange}
                        placeholder="Ej: 2025"
                        error={errors.cicloEscolar}
                        required
                    />
                    <div className="checkbox-container">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="becado"
                                checked={formData.becado}
                                onChange={handleChange}
                            />
                            <span>Estudiante Becado</span>
                        </label>
                    </div>
                </div>

                <div className="form-row">
                    <Input
                        label="Observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Observaciones adicionales..."
                    />
                </div>

                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {asignacion ? 'Guardar Cambios' : 'Inscribir Estudiante'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AsignacionModal;
