import React, { useState, useMemo } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Select from '../Select';
import Button from '../Button';
import './MateriaModal.css';

const MateriaModal = ({ isOpen, onClose, materia, cursos = [], profesores = [], onSave }) => {
    const isEditing = !!materia;

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

    const initialFormData = useMemo(() => ({
        nombre: materia?.nombre || '',
        descripcion: materia?.descripcion || '',
        curso: materia?.curso?._id || materia?.curso || '',
        profesor: materia?.profesor?._id || materia?.profesor || ''
    }), [materia]);

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Reset form cuando se abre el modal
    React.useLayoutEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setErrors({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, materia]);

    const cursoOptions = cursos.map(curso => ({
        value: curso.cid || curso._id,
        label: `${formatGrado(curso.grado)} "${curso.seccion}" - ${curso.jornada}`
    }));

    const profesorOptions = profesores.map(prof => ({
        value: prof.uid || prof._id,
        label: `${prof.name} ${prof.surname || ''} (${prof.username})`
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!formData.curso) newErrors.curso = 'El curso es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        
        const dataToSend = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            curso: formData.curso
        };

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
            title={isEditing ? 'Editar Materia' : 'Nueva Materia'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="materia-form">
                <div className="form-row">
                    <Input
                        label="Nombre de la Materia"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                        placeholder="Ej: Matemáticas"
                        required
                    />
                </div>

                <div className="form-row">
                    <Input
                        label="Descripción"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción de la materia..."
                    />
                </div>

                <div className="form-row two-cols">
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
                        {isEditing ? 'Guardar Cambios' : 'Crear Materia'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default MateriaModal;
