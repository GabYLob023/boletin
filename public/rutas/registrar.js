const express = require("express");
const router = express.Router();
const connection = require("../db/db");

router.post("/registrar", function(req, res) {
    const { apellido_nombre, direccion, password, email, dni, celular, nombre_curso } = req.body;

    // Validar los datos requeridos
    if (!apellido_nombre || !direccion || !password || !email || !dni || !celular || !nombre_curso) {
        return res.render("registro", { error: "Todos los campos son obligatorios" });
    }

    // Consulta SQL para insertar un nuevo alumno
    const insertar = `
        INSERT INTO alumno (apellido_nombre, dni, direccion, celular, nombre_roles, password, email, nombre_curso)
        VALUES (?, ?, ?, ?, 'alumno', ?, ?, ?)
    `;
    const valores = [apellido_nombre, dni, direccion, celular, password, email, nombre_curso];

    connection.query(insertar, valores, function(error, results) {
        if (error) {
            console.log("Error al intentar registrar alumno: ", error);
            return res.render("registro", { error: "Error al registrar el alumno" });
        }
        console.log("Registro exitoso");
        res.render("registro", { success: true });
    });
});

module.exports = router;
