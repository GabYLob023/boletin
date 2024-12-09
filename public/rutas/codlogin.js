const express = require("express");
const router = express.Router();
const connection = require("../db/db");
const link = require("../db/link");

// Ruta POST para '/codlogin'
router.post("/codlogin", function (req, res) {
    const nombre = req.body.apellido_nombre;
    const password = req.body.password;

    // Función para manejar el inicio de sesión exitoso
    function iniciarSesion(user, tipoUsuario) {
        req.session.login = true;
        req.session.id_usuario = user.id_alumno || user.id_alumnado || user.id_admin;
        req.session.apellido_nombre = user.apellido_nombre;
        req.session.password = user.password;
        req.session.email = user.email;
        req.session.dni = user.dni;
        req.session.direccion = user.direccion;
        req.session.nombre_roles = user.nombre_roles;
        req.session.tipo_usuario = tipoUsuario; // 'alumno', 'alumnado' o 'admin'

        // Solo los alumnos tienen 'nombre_curso'
        if (tipoUsuario === 'alumno') {
            req.session.nombre_curso = user.nombre_curso;
        } else {
            req.session.nombre_curso = null;
        }

        console.log(req.session);

        // Redirigir según el tipo de usuario
        if (tipoUsuario === 'alumno') {
            const id_alumno = user.id_alumno;

            const consultaNotas = `
                SELECT 
                    a.apellido_nombre AS Nombre_Alumno,
                    m.nombre_materias AS Materia,
                    b.informe1_cuatrimestre1 AS Informe1_C1,
                    b.informe2_cuatrimestre1 AS Informe2_C1,
                    b.nota_cuatrimestre1 AS Nota_C1,
                    b.informe1_cuatrimestre2 AS Informe1_C2,
                    b.informe2_cuatrimestre2 AS Informe2_C2,
                    b.nota_cuatrimestre2 AS Nota_C2,
                    b.nota_anual AS Nota_Anual,
                    b.nota_dic AS Nota_Dic,
                    b.nota_feb AS Nota_Feb,
                    b.nota_final AS Nota_Final
                FROM 
                    boletin b
                INNER JOIN 
                    alumno a ON b.id_alumno = a.id_alumno
                INNER JOIN 
                    materias m ON b.id_materias = m.id_materias
                WHERE 
                    a.id_alumno = ?;
            `;

            connection.query(consultaNotas, [id_alumno], function (error, rows) {
                if (error) {
                    console.error("Error al consultar las notas: ", error);
                    return res.status(500).send("Error en el servidor");
                }

                const notas = rows;

                // Renderizar la vista 'alumno' pasando 'user', 'notas' y 'link'
                res.render("alumno", { user: req.session, notas, link });
            });
        } else if (tipoUsuario === 'alumnado') {
            // Renderizar la vista 'alumnado' directamente
            const queryAlumnos = "SELECT * FROM alumno";
            const queryMaterias = `
                SELECT 
                    id_materias, 
                    nombre_materias
                FROM 
                    materias
            `;

            // Ejecutar ambas consultas en paralelo usando Promesas
            const getAlumnos = new Promise((resolve, reject) => {
                connection.query(queryAlumnos, function (error, results) {
                    if (error) {
                        console.error("Error al obtener los alumnos: ", error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            const getMaterias = new Promise((resolve, reject) => {
                connection.query(queryMaterias, function (error, results) {
                    if (error) {
                        console.error("Error al obtener las materias: ", error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            // Ejecutar ambas consultas y luego renderizar la vista
            Promise.all([getAlumnos, getMaterias])
                .then(([alumnos, materias]) => {
                    // Renderizar la vista 'alumnado' pasando 'user', 'alumnos', 'materias' y 'link'
                    res.render("alumnado", { user: req.session, alumnos, materias, link });
                })
                .catch(error => {
                    console.error("Error al obtener los datos: ", error);
                    res.status(500).send("Error en el servidor");
                });
        } else if (tipoUsuario === 'admin') {
            // Si es administrador, obtener la lista de alumnos, materias y personal de 'alumnado' y renderizar 'admin.ejs'
            const queryAlumnos = "SELECT * FROM alumno";
            const queryMaterias = "SELECT * FROM materias";
            const queryAlumnado = "SELECT * FROM alumnado";

            // Ejecutar todas las consultas en paralelo usando Promesas
            const getAlumnos = new Promise((resolve, reject) => {
                connection.query(queryAlumnos, function (error, results) {
                    if (error) {
                        console.error("Error al obtener los alumnos: ", error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            const getMaterias = new Promise((resolve, reject) => {
                connection.query(queryMaterias, function (error, results) {
                    if (error) {
                        console.error("Error al obtener las materias: ", error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            const getAlumnado = new Promise((resolve, reject) => {
                connection.query(queryAlumnado, function (error, results) {
                    if (error) {
                        console.error("Error al obtener el personal de alumnado: ", error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            // Ejecutar todas las consultas y luego renderizar la vista
            Promise.all([getAlumnos, getMaterias, getAlumnado])
                .then(([alumnos, materias, alumnado]) => {
                    // Renderizar la vista 'admin' pasando 'user', 'alumnos', 'materias', 'alumnado', y 'link'
                    res.render("admin", { user: req.session, alumnos, materias, alumnado, link });
                })
                .catch(error => {
                    console.error("Error al obtener los datos: ", error);
                    res.status(500).send("Error en el servidor");
                });
        } else {
            // Si el tipo de usuario no es reconocido, redirigir o mostrar error
            res.status(400).send("Tipo de usuario no reconocido");
        }
    }

    // Función para manejar autenticación
    function autenticarUsuario(nombre, password, tabla, tipoUsuario) {
        const validar_usuario = `SELECT * FROM ${tabla} WHERE apellido_nombre= ?`;
        connection.query(validar_usuario, [nombre], function (error, rows) {
            let mensaje;
            if (error) {
                console.log(`Error en la consulta para consultar el nombre en ${tabla}: `, error);
                return res.status(500).send("Error en el servidor");
            }
            if (rows.length < 1) {
                // Si no se encontró en esta tabla, verificar en la siguiente
                if (tipoUsuario === 'alumno') {
                    // Intentar en la tabla 'alumnado'
                    autenticarUsuario(nombre, password, 'alumnado', 'alumnado');
                } else if (tipoUsuario === 'alumnado') {
                    // Intentar en la tabla 'admin'
                    autenticarUsuario(nombre, password, 'admin', 'admin');
                } else {
                    // Usuario no encontrado en ninguna tabla
                    mensaje = "El usuario ingresado no existe";
                    res.render("iniciar", { mensaje, link });
                }
            } else {
                const user = rows[0];
                if (password !== user.password) {
                    mensaje = "Contraseña incorrecta";
                    res.render("index", { mensaje, link });
                } else {
                    iniciarSesion(user, tipoUsuario);
                }
            }
        });
    }

    // Iniciar autenticación comenzando por la tabla 'alumno'
    autenticarUsuario(nombre, password, 'alumno', 'alumno');
});

// Ruta POST para '/insertarNotas'
router.post('/insertarNotas', function(req, res) {
    // Obtener los datos del formulario
    const id_alumno = req.body.id_alumno;
    const id_materias = req.body.id_materias; // Array
    const informe1_cuatrimestre1 = req.body.informe1_cuatrimestre1 || [];
    const informe2_cuatrimestre1 = req.body.informe2_cuatrimestre1 || [];
    const nota_cuatrimestre1 = req.body.nota_cuatrimestre1 || [];
    const informe1_cuatrimestre2 = req.body.informe1_cuatrimestre2 || [];
    const informe2_cuatrimestre2 = req.body.informe2_cuatrimestre2 || [];
    const nota_cuatrimestre2 = req.body.nota_cuatrimestre2 || [];
    const nota_anual = req.body.nota_anual || [];
    const nota_dic = req.body.nota_dic || [];
    const nota_feb = req.body.nota_feb || [];
    const nota_final = req.body.nota_final || [];

    // Preparar los valores para la inserción
    const values = [];

    for (let i = 0; i < id_materias.length; i++) {
        const id_materia = parseInt(id_materias[i], 10);

        // Insertar sólo las materias relevantes, manejando valores opcionales como `NULL`
        values.push([
            id_alumno,
            id_materia,
            informe1_cuatrimestre1[i] || null,
            informe2_cuatrimestre1[i] || null,
            nota_cuatrimestre1[i] || null,
            informe1_cuatrimestre2[i] || null,
            informe2_cuatrimestre2[i] || null,
            nota_cuatrimestre2[i] || null,
            nota_anual[i] || null,
            nota_dic[i] || null,
            nota_feb[i] || null,
            nota_final[i] || null
        ]);
    }

    // Consulta SQL para insertar múltiples registros
    const sql = `INSERT INTO boletin (
        id_alumno, 
        id_materias, 
        informe1_cuatrimestre1, 
        informe2_cuatrimestre1, 
        nota_cuatrimestre1, 
        informe1_cuatrimestre2, 
        informe2_cuatrimestre2, 
        nota_cuatrimestre2, 
        nota_anual, 
        nota_dic, 
        nota_feb, 
        nota_final
    ) VALUES ?`;

    // Ejecutar la consulta
    connection.query(sql, [values], function(error, results) {
        if (error) {
            console.error('Error al insertar las notas:', error);
            return res.status(500).json({ success: false, message: 'Error en el servidor al insertar las notas.' });
        }
        //res.json({ success: true, message: 'Notas insertadas correctamente.' });
    });
});

module.exports = router;
