export const validateName = (name) => {
    return name && name.trim().length >= 2;
};

export const validateNameMessage = 'El nombre debe tener al menos 2 caracteres';