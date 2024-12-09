const express = require("express");
const path = require("path");
const app = express();
const sesion = require("express-session"); 

//variables de sesion
app.use(sesion({
    secret:"secret",
    resave:false,
    saveUninitialized:false
}));

//invoca al modulo de conexion BD

const conection =require('./db/db');


// Configuración de la aplicación
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://


//rutas dinamicas y estaticas :::::::::::::::::::::::
app.use(express.static("public"))
app.use(require("./rutas/index"));
app.use(require("./rutas/iniciar"));
app.use(require("./rutas/registro"));
app.use(require("./rutas/registrar"));
app.use(require("./rutas/registro2"));
app.use(require("./rutas/carga_alumnado"));
app.use(require("./rutas/codlogin"));
app.use(require("./rutas/alumno"));
app.use(require("./rutas/alumnado"))
app.use(require("./rutas/rutanotas"));


const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log(`El servidor está corriendo en: http://localhost:${PORT}`);
});
