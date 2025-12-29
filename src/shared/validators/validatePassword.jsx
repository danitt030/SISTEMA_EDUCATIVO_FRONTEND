export const validatePassword = (password) => {
    // Mínimo 8 caracteres
    return password && password.length >= 8;
};

export const validatePasswordMessage = 'La contraseña debe tener al menos 8 caracteres';