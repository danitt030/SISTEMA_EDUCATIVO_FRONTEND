export const validateConfirmPassword = (password, confirmPassword) => {
    return password === confirmPassword;
};

export const validateConfirmPasswordMessage = 'Las contraseñas no coinciden';