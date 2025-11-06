const { dbConnection } = require('../../database/config');

const esRolValido = async( rol = '' ) => {
    //const bExistRol = await Rol.findOne({ where: { "rol": rol } }) || false;
    const [results, metadata] = await dbConnection.query(`call getRol('${rol}')`);
    if( !results ){
        throw new Error('Error no es un rol válido');
    }
}

//Validar el correo
const existeEmail = async(email = '') => {
    const [results, metadata] = await dbConnection.query(`CALL getEmail('${email}')`);
    
    if( results ){
            throw new Error('Ese Email ya existe');
    }
}

module.exports= {
    esRolValido,
    existeEmail
}