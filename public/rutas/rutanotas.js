const express = require("express");
const router = express.Router();
const connection = require("../db/db");

// Ruta para obtener las notas de un alumno en una materia
router.get('/obtenerNotas', function(req, res) {
    const { id_alumno, id_materia } = req.query;

    const sql = `
        SELECT 
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
        FROM boletin
        WHERE id_alumno = ? AND id_materias = ?;
    `;

    connection.query(sql, [id_alumno, id_materia], function(error, results) {
        if (error) {
            console.error('Error al obtener las notas:', error);
            return res.json({ success: false, message: 'Error al obtener las notas.' });
        }

        if (results.length > 0) {
            res.json({ success: true, notas: results[0] });
        } else {
            res.json({ success: false, message: 'No se encontraron notas para el alumno y materia seleccionados.' });
        }
    });
});

// Ruta para editar las notas de un alumno en una materia
router.post('/editarNotas', function(req, res) {
    const {
        id_alumno,
        id_materia,
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
    } = req.body;

    const sql = `
        UPDATE boletin
        SET 
            informe1_cuatrimestre1 = ?, 
            informe2_cuatrimestre1 = ?, 
            nota_cuatrimestre1 = ?,
            informe1_cuatrimestre2 = ?, 
            informe2_cuatrimestre2 = ?, 
            nota_cuatrimestre2 = ?,
            nota_anual = ?, 
            nota_dic = ?, 
            nota_feb = ?, 
            nota_final = ?
        WHERE id_alumno = ? AND id_materias = ?;
    `;

    connection.query(sql, [
        informe1_cuatrimestre1 || null,
        informe2_cuatrimestre1 || null,
        nota_cuatrimestre1 || null,
        informe1_cuatrimestre2 || null,
        informe2_cuatrimestre2 || null,
        nota_cuatrimestre2 || null,
        nota_anual || null,
        nota_dic || null,
        nota_feb || null,
        nota_final || null,
        id_alumno,
        id_materia
    ], function(error, results) {
        if (error) {
            console.error('Error al editar las notas:', error);
            return res.status(500).json({ success: false, message: 'Error en el servidor al editar las notas.' });
        }

        if (results.affectedRows > 0) {
            res.json({ success: true, message: 'Notas actualizadas correctamente.' });
        } else {
            res.json({ success: false, message: 'No se encontraron registros para actualizar.' });
        }
    });
});

module.exports = router;
