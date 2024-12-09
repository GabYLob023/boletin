const express = require("express");
const router = express.Router();
const connection = require("../db/db");
const link = require("../db/link");

router.get("/admin", function (req, res) {
    // Verificar si el usuario ha iniciado sesión
    if (!req.session.login) {
        return res.redirect("/iniciar");
    }

    // Verificar si el usuario es de tipo 'admin'
    if (req.session.tipo_usuario !== 'admin') {
        return res.status(403).send("Acceso denegado");
    }

    // Consultas para obtener los datos necesarios
    const queryAlumnos = "SELECT * FROM alumno"; // Ajusta la consulta según tu base de datos
    const queryMaterias = "SELECT * FROM materias"; // Ajusta la consulta según tu base de datos
    const queryAlumnado = "SELECT * FROM alumnado"; // Ajusta la consulta según tu base de datos

    // Ejecutar las consultas en paralelo usando Promesas
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

    // Esperar a que todas las consultas terminen y luego renderizar la vista
    Promise.all([getAlumnos, getMaterias, getAlumnado])
        .then(([alumnos, materias, alumnado]) => {
            res.render("admin", { user: req.session, alumnos, materias, alumnado, link });
        })
        .catch(error => {
            console.error("Error al obtener los datos: ", error);
            res.status(500).send("Error en el servidor");
        });
});

module.exports = router;
