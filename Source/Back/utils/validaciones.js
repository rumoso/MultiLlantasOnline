module.exports = {
  STRING_REGEX: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\_\.,&"]+$/,
  STRING_MSG: 'solo debe contener letras, números, espacios, guion medio, guion bajo, coma, punto, &, y comillas dobles. No se permiten otros caracteres especiales.',
  USERNAME_REGEX: /^[a-zA-Z0-9_\-!"#$%&\/()=¿?,.]+$/,
  USERNAME_MSG: 'solo debe contener letras, números, guion bajo, guion medio y los símbolos !"#$%&/()=¿?,. No se permiten otros caracteres.'
};