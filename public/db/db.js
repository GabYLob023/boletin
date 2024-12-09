const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
    database: "boletinprueba",
    user: "root",
    password: "boletin1234"
});

connection.connect((error) => {
  if (error) {
    console.log("Error de conexión:", error);
    return;
  }
    console.log("Conexión exitosa");
  });

  module.exports=connection;