const { response } = require('express');
const { Op } = require('sequelize');
const { dbConnection, dbSPConnection } = require('../database/config');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

const UnidadMedida = require('../models/productos/unidadmedida');
const Familias = require('../models/productos/familias');
const Productos = require('../models/productos/productos');
const Descripciones = require('../models/productos/descripciones');
const CatTipoProducto = require('../models/productos/cattipoproducto');

const unidadesMedidaGet = async(req, res = response) => {
    const {search="", start= 0, limiter = 100} = req.body;
    const { count, rows} = await UnidadMedida.findAndCountAll({ 
                    where:{[Op.or]:[{name:{[Op.like]:'%'+search+'%'}},{abreviatura:{[Op.like]:'%'+search+'%'}}]},
                    limit:parseInt(limiter),
                    offset:parseInt(start)    
                });
    
    res.json({
        status:0,
        message:'Unidades de medida',
        data:{count, rows}
    });
}

const unidadesMedidaGuardar = async(req, res = response) => {
    const { idUnidadMedida = 0, name, abreviatura, active} = req.body;
  
    try{

        if( idUnidadMedida === 0){
            UnidadMedida.create({idUnidadMedida, name, abreviatura, active}).then(
                unidadMedida =>{
                        res.json({
                            status:0,
                            message: 'Unidad medida Guardada.',
                            data: unidadMedida
                        });
                }
            ).catch(error => console.error(error));
        }else{

            const unidadMedida = await UnidadMedida.findOne( { 
                where: { idUnidadMedida }
            });

            const oUpdate = await UnidadMedida.update({name, abreviatura, active}, { where: { idUnidadMedida } } );

            res.json({
                status:0,
                message: 'Unidad de medida Actualizada.',
                data: unidadMedida
            });
        }

    }catch(error){
        res.json({
            status:2,
            message: 'Ocurrió un error en el servicio.',
            data: error
        });
    }    
}

const unidadMedidaById = async(req, res = response) =>{
    const idUnidadMedida = req.params.id;
    const unidadesmedida = await UnidadMedida.findByPk(idUnidadMedida);
    
    res.json({
        status:0,
        message:'Unidades de medida por Id.',
        data:unidadesmedida
    });
}

const unidadMedidaDelete = async(req, res = response) => {
    const idUnidadMedida = req.params.id;
    const unidadesmedida = await UnidadMedida.destroy({where:{idUnidadMedida}});
    
    res.json({
        status:0,
        message:'Unidad de medida eliminada.',
        data:unidadesmedida
    });
}

const familiasGet = async(req, res = response) => {

    const {search="", start= 0, limiter = 100} = req.body;
    const { count, rows} = await Familias.findAndCountAll({ 
                    where:{name:{[Op.like]:'%'+search+'%'}, active:true},
                    limit:limiter,
                    offset:start    
                });
    
    res.json({
        status:0,
        message:'Consulta de Familias',
        data:{count, rows}
    });        
}

const familiaById = async(req, res = response) =>{
    const idFamilia = req.params.id;
    const familia = await Familias.findByPk(idFamilia);
    
    res.json({
        status:0,
        message:'Familia por Id.',
        data:familia
    });
}

const familiaDelete = async(req, res = response) => {
    const idFamilia = req.params.id;
    // const familia = await Familias.destroy({where:{idFamilia}});
    const familia = await Familias.update( {active:false}, { where: { idFamilia} }  );
    
    res.json({
        status:0,
        message:'familia eliminada.',
        data:familia
    });
}

const familiasGuardar = async(req, res = response) => {
    const { idFamilia = 0, name, active} = req.body;
    
    try{

        if( idFamilia === 0){
            Familias.create({idFamilia, name, active}).then(
                familia =>{
                        res.json({
                            status:0,
                            message: 'Familia Guardada.',
                            data:familia
                        });
                }
            ).catch(error => console.error(error));
        }else{

            const familia = await Familias.findOne( { 
                where: { idFamilia }
            });
            
            const oUpdate = await Familias.update({ name, active }, { where: { idFamilia } } );
            res.json({
                status:0,
                message: 'Familia actualizada.',
                data: familia
            });
        }

    }catch(error){
        res.json({
            status:2,
            message: 'Ocurrió un error en el servicio.',
            data: error
        });
    }    
}

const productoIDSugerido = async(req, res) => {
    const {idcatcategoriaproducto = 0 } = req.query;
    const producto = await Productos.findOne( { where:{idcatcategoriaproducto}, order: [ ['idproductocategoria', 'DESC']], attributes:['idproductocategoria'] });
    let folioSugerido = producto ? (producto.idproductocategoria + 1) : 1;
    res.json({
        status:0,
        message:'',
        data:(folioSugerido)
    });
}

const productosGetAll = async(req, res = response) => {
        
    const{ limiter = 1000, start = 0, search = "", tipoProducto = 0, idcatcategoriaproducto = 0 } =req.body;
    
    let where = {active: 1};
    console.log('search', search);
     
    // Verificamos si search es un número para buscar por idproductocategoria
    const trimmedSearch = String(search || '').trim(); // Ensure search is a string, trim whitespace, handle null/undefined
    const isNumeric = trimmedSearch !== '' && /^\d+$/.test(trimmedSearch); // Check if the trimmed string consists only of digits
    
    // Si es un número, agregamos la condición para idproductocategoria
    if (isNumeric) {
        where = { 
            ...where, 
            idproductocategoria: parseInt(trimmedSearch, 10) // Parse the validated numeric string
        };
    }



    if( tipoProducto > 0 ){
        where = { ...where, idCatTipoProducto:tipoProducto};
    }

    if( idcatcategoriaproducto > 0 ){
        where = { ...where, idcatcategoriaproducto};
    }   
    
    const {count, rows }= await Productos.findAndCountAll( 
        { where, 
        order: [
            ['idproductocategoria', 'ASC']
        ],
        include:[ 
            {
                model: Descripciones,                 
                as:'descripciones',
                required:true,
                where: (!isNumeric && search) ? { description: { [Op.like]: `%${search}%` } } : {}
            },
            {
                model: CatTipoProducto,                 
                as:'tipoproducto',
                required:true
            },
            {
                model:UnidadMedida,
                as:'unidadmedida',
                required:true
            },
            {
                model:Productos,
                as:'productobase',
                required:false,
                include:[{
                    model: Descripciones,                 
                    as:'descripciones',
                    required:true,
                }]
            }
        ] ,
        offset: parseInt(start),
        limit: parseInt(limiter)
        });            

res.json({
    status:0,
    message:'',
    data:{
        count,
        rows
    }
});
}

const productoGuardar = async(req, res = response) => {
    try {
          // Debug logs
          console.log('Files:', req.files);
          console.log('Body:', req.body);
        // Parse producto JSON from FormData
        const productoData = JSON.parse(req.body.producto);

        // Extract fields from producto object
        var {
            idProducto = 0,
            createDate,
            sku,
            idDescription,
            valorMedida,
            idUnidadMedida,
            idCatTipoProducto = 1,
            idProductoRelacion = 0,
            porcentajeRelation = 100,
            idcatcategoriaproducto,
            idproductocategoria,
            costo,
            precio,
            active,
            imageUrl,
            bEnvase = false,
            idFamilia = 0,
            precioEcoAgr = 0,
            porcentDineroElectronico = 3,
            porcentDineroElectronicoEnvase = 0
        } = productoData;

       // Handle image upload
       let imageUrlNew = null;
       if (req.files && req.files.image) {
           try {
               const uploadedFile = req.files.image;
               
               // Validar tipo de archivo
               const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
               if (!allowedTypes.includes(uploadedFile.mimetype)) {
                   return res.status(400).json({
                       status: 1,
                       message: 'Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG y GIF',
                       data: null
                   });
               }

               // Validar tamaño (máximo 5MB)
               const maxSize = 5 * 1024 * 1024;
               if (uploadedFile.size > maxSize) {
                   return res.status(400).json({
                       status: 1,
                       message: 'La imagen es demasiado grande. Máximo 5MB permitido',
                       data: null
                   });
               }

               const fileExtension = path.extname(uploadedFile.name).toLowerCase();
               const fileName = `producto_${Date.now()}_${Math.round(Math.random() * 1E9)}${fileExtension}`;
               const uploadDir = path.join(__dirname, '../assets/productos');
               const uploadPath = path.join(uploadDir, fileName);
               
               // Crear directorio si no existe
               if (!fs.existsSync(uploadDir)) {
                   fs.mkdirSync(uploadDir, { recursive: true });
               }
               
               // Mover el archivo
               await uploadedFile.mv(uploadPath);
               imageUrlNew = fileName;
           } catch (error) {
               console.error('Error al procesar la imagen:', error);
               return res.status(500).json({
                   status: 1,
                   message: 'Error al procesar la imagen',
                   data: error.message
               });
           }
       }

        const validations = await Promise.all([
            UnidadMedida.findByPk(idUnidadMedida),
            Descripciones.findByPk(idDescription),
            CatTipoProducto.findByPk(idCatTipoProducto),
            idProductoRelacion ? Productos.findByPk(idProductoRelacion) : Promise.resolve(true)
        ]);

        const [unidadMedida, descripcion, tipoProducto, productoBase] = validations;

        if (!unidadMedida) {
            return res.json({
                status: 1,
                message: 'La unidad de medida especificada no existe',
                data: null
            });
        }

        if (!descripcion) {
            return res.json({
                status: 1,
                message: 'La descripción especificada no existe',
                data: null
            });
        }

        if (!tipoProducto) {
            return res.json({
                status: 1,
                message: 'El tipo de producto especificado no existe',
                data: null
            });
        }

        if (idProductoRelacion && !productoBase) {
            return res.json({
                status: 1,
                message: 'El producto base especificado no existe',
                data: null
            });
        }

        if (idProducto === 0) {
            const productoCreado = await Productos.create({
                idProducto,
                createDate,
                sku,
                idDescription,
                valorMedida,
                idUnidadMedida,
                idCatTipoProducto,
                idProductoRelacion,
                porcentajeRelation,
                idcatcategoriaproducto,
                idproductocategoria,
                costo,
                precio,
                imageUrl: (imageUrlNew ? imageUrlNew : imageUrl),
                active,
                bEnvase,
                idFamilia,
                precioEcoAgr,
                porcentDineroElectronico,
                porcentDineroElectronicoEnvase
            });
            
            var producto = await dbConnection.query(`CALL getProductoByID( ${ productoCreado.idProducto } )`);

            var oProduct = producto[0] || null;

            if(oProduct && oProduct.idProducto > 0
                // SI ES PRODUCTO O OPERATIVOS
                && ( oProduct.idFamilia == 1 ||  oProduct.idFamilia == 4 )
                // SI ES PRODUCTO, BASE O AGRANEL
                && ( oProduct.idCatTipoProducto == 1 || oProduct.idCatTipoProducto == 3 || oProduct.idCatTipoProducto == 4 )
            ){
                const oSQLUpdateCosto = await dbConnection.query(`CALL actualizar_costo_producto( ${ oProduct.idProducto } )`);
            }else if(oProduct && oProduct.idProducto > 0
                // SI ES PRODUCTO O OPERATIVOS
                && ( oProduct.idFamilia == 1 ||  oProduct.idFamilia == 4 )
                // SI ES MATERIA PRIMA O INSUMO
                && ( oProduct.idCatTipoProducto == 2 || oProduct.idCatTipoProducto == 5 )
            ){
                const oSQLUpdateCosto = await dbConnection.query(`CALL recalcular_costos_por_mp_insumo( ${ oProduct.idProducto } )`);
            }

            res.json({
                status: 0,
                message: 'Producto Guardado.',
                data: producto[0] || null
            });
        } else {

            //  If updating and new image exists, delete old image
             if ((imageUrlNew && imageUrl !== imageUrlNew) || imageUrl === null) {
                const oldProduct = await Productos.findByPk(idProducto);
                if (oldProduct && oldProduct.imageUrl) {
                    const oldImagePath = path.join(__dirname, '../assets/productos', oldProduct.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }

            const productSave = await Productos.update({
                createDate,
                sku,
                idDescription,
                valorMedida,
                idUnidadMedida,
                idCatTipoProducto,
                idProductoRelacion,
                porcentajeRelation,
                idcatcategoriaproducto,
                idproductocategoria,
                costo,
                precio,
                imageUrl:(imageUrlNew ? imageUrlNew : imageUrl),
                active,
                bEnvase,
                idFamilia,
                precioEcoAgr,
                porcentDineroElectronico,
                porcentDineroElectronicoEnvase
            }, {
                where: { idProducto }
            });

            var producto = await dbConnection.query(`CALL getProductoByID( ${ idProducto } )`);

            var oProduct = producto[0] || null;

            if(oProduct && oProduct.idProducto > 0
                // SI ES PRODUCTO O OPERATIVOS
                && ( oProduct.idFamilia == 1 ||  oProduct.idFamilia == 4 )
                // SI ES PRODUCTO, BASE O AGRANEL
                && ( oProduct.idCatTipoProducto == 1 || oProduct.idCatTipoProducto == 3 || oProduct.idCatTipoProducto == 4 )
            ){
                const oSQLUpdateCosto = await dbConnection.query(`CALL actualizar_costo_producto( ${ oProduct.idProducto } )`);
            }else if(oProduct && oProduct.idProducto > 0
                // SI ES PRODUCTO O OPERATIVOS
                && ( oProduct.idFamilia == 1 ||  oProduct.idFamilia == 4 )
                // SI ES MATERIA PRIMA O INSUMO
                && ( oProduct.idCatTipoProducto == 2 || oProduct.idCatTipoProducto == 5 )
            ){
                const oSQLUpdateCosto = await dbConnection.query(`CALL recalcular_costos_por_mp_insumo( ${ oProduct.idProducto } )`);
            }

            res.json({
                status: 0,
                message: 'Producto Actualizado.',
                data: producto
            });
        }
    } catch(error) {
        console.error(error);
        res.json({
            status: 2,
            message: 'Ocurrió un error en el servicio.',
            data: error
        });
    }
}

const productosGetById = async(req, res = response) => {        
    const {idcatcategoriaproducto = 0 , idproductocategoria = 0 } = req.query;

    const producto = await dbConnection.query(`CALL getProductoByIDCategoria(
        ${ idproductocategoria }
        , ${ idcatcategoriaproducto }
        )`);
    
    res.json({
        status:0,
        message:'',
        data: producto[0] || null
    });
}

const productosDelete = async(req, res) => {
    const idProducto = req.params.id;
    
    const producto = await Productos.update(
        { active: false, idproductocategoria: 0 }
        , { where: { idProducto} }  );

    res.json({
        status:0,
        message:'Producto eliminado.',
        data:producto
    });
}

const obtenerDescripciones = async(req, res) =>{
    const{ search = "", start, limiter =1000 } =req.body;
    
    const {count, rows } = await Descripciones.findAndCountAll( 
        { where: { description:{[Op.like]:'%' + search + '%'}, active:true},
        offset: parseInt(start),
        limit: parseInt(limiter)    }  );

    res.json({
        status:0,
        message:'Obtener descripciones.',
        data:{count, rows }
    });
}

const getCatTipoProductoAll = async( req, res ) => {
    const{ search = "", start=0, limiter =1000, idCatTipoProducto = [] } =req.body;
    
    let whereClause = { 
        descripcion: {[Op.like]: '%' + search + '%'}
    };
console.log('idCatTipoProducto', idCatTipoProducto);
    // Add idCatTipoProducto filter if array is not empty
    if (idCatTipoProducto.length > 0) {
        whereClause = {
            ...whereClause,
            idCatTipoProducto: {[Op.in]: idCatTipoProducto}
        };
    }

    const {count, rows } = await CatTipoProducto.findAndCountAll( { 
        where: whereClause,
        offset: parseInt(start),
        limit: parseInt(limiter)    }  );

    res.json({
        status:0,
        message:'Obtener catálogo tipo de productos.',
        data:{count, rows }
    });
}

const descripcionGuardar= async(req, res = response) => {
    const { idDescription = 0, description, active} = req.body;
    
    try {

        if (idDescription === 0) {
            // Buscar si ya existe una descripción activa con ese texto
            const descripcionExistente = await Descripciones.findOne({
                where: {
                    description: description,
                    active: true
                }
            });

            if (descripcionExistente) {
                // Ya existe, regresar esa
                return res.json({
                    status: 0,
                    message: 'La descripción ya existia.',
                    data: descripcionExistente
                });
            }

            // Si no existe, crearla
            const descripcion = await Descripciones.create({ idDescription, description, active });
            res.json({
                status: 0,
                message: 'Descripción Guardada.',
                data: descripcion
            });
        } else {
            const descripcion = await Descripciones.update({ description, active }, { where: { idDescription } });
            res.json({
                status: 0,
                message: 'Descripción actualizada.',
                data: descripcion
            });
        }

    } catch (error) {
        res.json({
            status: 2,
            message: 'Ocurrió un error en el servicio.',
            data: error
        });
    }    
}

const descripcionById = async(req, res = response) =>{
    const idDescription = req.params.id;
    const descripcion = await Descripciones.findByPk(idDescription);
    
    res.json({
        status:0,
        message:'Descripción por Id.',
        data:descripcion
    });
}

const descripcionDelete = async(req, res) => {
    const idDescription = req.params.id;
        
    const descripcion = await Descripciones.update( {active:false}, { where: { idDescription} }  );

    res.json({
        status:0,
        message:'Descripción eliminada.',
        data:descripcion
    });
}

const cbxGetUnidadesMedida = async(req, res = response) => {

    const {
        search = ''
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxGetUnidadesMedida( '${ search }' )`)

        if(OSQL.length == 0){

            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });

        }
        else{

            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });

        }

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }

};

const cbxArticulosParaOC = async(req, res = response) => {

    const { idOrdenDeCompra, search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxArticulosParaOC( ${ idOrdenDeCompra }, '${ search }' )`)

        if(OSQL.length == 0){

            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });

        }
        else{

            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });

        }

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }

};

const getProductoByID = async (req, res) => {
    const { idProducto } = req.body;

    try {
        const result = await dbConnection.query(`CALL getProductoByID( ${idProducto} )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: result[0] || null
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cbxProductos = async(req, res = response) => {

    const {
        search = ''
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxProductos( '${ search }' )`)

        if(OSQL.length == 0){

            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });

        }
        else{

            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });

        }

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }

};

const getInsumosByProductosPaginado = async (req, res) => {
    const { idProducto } = req.body;

    try {
        const result = await dbConnection.query(`CALL getInsumosByProductosPaginado( ${ idProducto } )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const agregarInsumoAlProducto = async (req, res) => {
    const { idProducto, idInsumo, idUserLogON, keyx = 0 } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var result = await connection.query(`CALL agregarInsumoAlProducto( '${ oGetDateNow }', ${ idProducto }, ${ idInsumo }, ${ idUserLogON }, ${ keyx } )`);
        result = result[0][0] || [];

        const oSQLUpdateCosto = await connection.query(`CALL actualizar_costo_producto( ${ idProducto } )`);

        await connection.commit();
        connection.release();

        res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message,
            insertID: result[0].out_id
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const deleteInsumoDelProducto = async (req, res) => {
    const { keyx, idProducto } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        var result = await dbConnection.query(`CALL deleteInsumoDelProducto( ${ keyx } )`);
        result = result[0][0] || [];

        const oSQLUpdateCosto = await connection.query(`CALL actualizar_costo_producto( ${ idProducto } )`);

        await connection.commit();
        connection.release();

        res.json({
            status: 0,
            message: 'Eliminado correctamente.',
            data: result
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cbxGetFamilias = async(req, res = response) => {

    const {
        search = ''
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxGetFamilias( '${ search }' )`)

        if(OSQL.length == 0){

            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });

        }
        else{

            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });

        }

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }

};

const cbxProductosByType = async(req, res = response) => {

    const {
        search = ''
        , idCatTipoProducto
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxProductosByType( '${ search }', ${ idCatTipoProducto } )`)

        if(OSQL.length == 0){

            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });

        }
        else{

            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });

        }

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }

};


const cbxArticulosParaRepVentas = async(req, res = response) => {
    const { search = '', idUserLogON } = req.body;
    try{
        var OSQL = await dbConnection.query(`call cbxArticulosParaRepVentas( '${ search }', ${ idUserLogON } )`)
        if(OSQL.length == 0){
            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });
        }
        else{
            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });
        }
    }catch(error){
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const cbxProductosFromConvert = async(req, res = response) => {
    const { search = '', idOrigen, idUserLogON } = req.body;
    try{
        var OSQL = await dbConnection.query(`call cbxProductosFromConvert( '${ search }', ${ idOrigen }, ${ idUserLogON } )`)
        if(OSQL.length == 0){
            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });
        }
        else{
            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });
        }
    }catch(error){
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const convertirProductos = async (req, res = response) => {
    var { idOrigen, listaConversion, idUserLogON } = req.body;
  
    var connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        var oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        var oSQL = await connection.query(`call convertirProductos(
        '${ oGetDateNow }'
        , '${ JSON.stringify(listaConversion) }'
        , ${ idOrigen }
        , ${ idUserLogON }
        )`)
        oSQL = oSQL[0][0][0];

        if (oSQL.out_id > 0) {
            await connection.commit();
            connection.release();
            return res.json({
                status: 0,
                message: oSQL.message,
                insertID: oSQL.out_id
            });
        } else {
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: oSQL.message,
                insertID: oSQL.out_id
            });
        }

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const revisarPedidosPendientes = async (req, res) => {
    let {
        iOption = 0
        , idRelation = 0

        , idUserLogON
    } = req.body;

    if(!iOption){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    try {

        var oData = await dbConnection.query(`CALL revisarPedidosPendientes(
            ${iOption}
            , ${idRelation}
        )`);

        console.log('oData', oData);

        if (oData.length == 0) {
            return res.json({
                status: 0,
                message: 'Todo bien'
            });
        } else {
            
            // Suponiendo que oData es un array de objetos con idHeader, articuloName y cantidad
            let pendientes = oData.map(item =>
                `#${item.idHeader}: ${item.articuloName} (${item.cantidad})`
            ).join('\n');

            return res.json({
                status: 1,
                message: 'Existen pedidos pendientes de los siguientes artículos:',
                detalle: pendientes,
                data: oData
            });

        }


    } catch (error) {

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } }
        });
    }
};

const cbxOrigenesForConvert = async(req, res = response) => {
    const { search = '', idUserLogON } = req.body;
    try{
        var OSQL = await dbConnection.query(`call cbxOrigenesForConvert( '${ search }', ${ idUserLogON } )`)
        if(OSQL.length == 0){
            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });
        }
        else{
            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });
        }
    }catch(error){
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

module.exports = {
    unidadesMedidaGet,
    unidadMedidaById,
    unidadMedidaDelete,
    unidadesMedidaGuardar,    
    familiasGet,
    familiaById,
    familiaDelete,
    familiasGuardar,
    productoGuardar,     
    productosGetAll, 
    productosGetById,
    productosDelete,
    productoIDSugerido,
    obtenerDescripciones,
    descripcionGuardar,
    descripcionById,
    descripcionDelete,
    cbxGetUnidadesMedida,
    getCatTipoProductoAll,
    cbxArticulosParaOC,
    getProductoByID,

    cbxProductos,
    getInsumosByProductosPaginado,
    agregarInsumoAlProducto,
    deleteInsumoDelProducto,
    cbxGetFamilias, 

    cbxProductosByType,
    cbxArticulosParaRepVentas,
    cbxProductosFromConvert,
    convertirProductos,
    revisarPedidosPendientes,
    cbxOrigenesForConvert
};


