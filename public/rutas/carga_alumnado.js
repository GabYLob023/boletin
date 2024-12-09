const express = require("express");
const router = express.Router();
const connection = require("../db/db");
const link = require("../db/link"); 

router.post("/carga_alumnado", function(req, res) {
    let nombre = req.body.apellido_nombre;
    let direccion = req.body.direccion;
    let password = req.body.password;
    let email = req.body.email;
    let dni = req.body.dni;
    let celular = req.body.celular;

    // Dado que este registro es solo para alumnado, definimos el rol fijo a "alumnado"
    let roles = "alumnado";

    // Insertamos directamente en la tabla 'alumnado'
    const insertar = "INSERT INTO alumnado (apellido_nombre, dni, direccion, celular, nombre_roles, password, email) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const valores = [nombre, dni, direccion, celular, roles, password, email];

    connection.query(insertar, valores, function(error, results) {
        if (error) {
            console.log("Error al intentar registrar en alumnado: ", error);
            res.render('registro2', { error: 'Error al registrar usuario' });
        } else {
            console.log("Registro exitoso en alumnado");
            res.render('registro2', { success: true });
        }
    });
});

module.exports = router;
