import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../../services';
import toast from 'react-hot-toast';

export const useUser = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = useCallback(async (filters = {}) => {
        setIsLoading(true);
        const response = await getAllUsers({ ...filters, limite: 1000 });
        setIsLoading(false);

        if (response.error) {
            toast.error('Error al cargar usuarios');
            return;
        }

        setUsers(response.data?.users || response.data || []);
    }, []);

    const getUser = async (uid) => {
        const response = await getUserById(uid);
        if (response.error) {
            toast.error('Error al obtener usuario');
            return null;
        }
        return response.data;
    };

    const editUser = async (uid, userData) => {
        const response = await updateUser(uid, userData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al actualizar usuario');
            return false;
        }
        toast.success('Usuario actualizado correctamente');
        fetchUsers();
        return true;
    };

    const removeUser = async (uid) => {
        const response = await deleteUser(uid);
        if (response.error) {
            toast.error('Error al eliminar usuario');
            return false;
        }
        toast.success('Usuario eliminado correctamente');
        fetchUsers();
        return true;
    };

    const toggleUserStatus = async (uid, currentStatus) => {
        const response = await updateUser(uid, { status: !currentStatus });
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al cambiar estado');
            return false;
        }
        toast.success(`Usuario ${currentStatus ? 'desactivado' : 'activado'} correctamente`);
        fetchUsers();
        return true;
    };

    return {
        users,
        isLoading,
        fetchUsers,
        getUser,
        editUser,
        removeUser,
        toggleUserStatus
    };
};