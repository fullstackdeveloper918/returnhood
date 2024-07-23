import mysql from "mysql2";

let db_con = mysql.createConnection({
  host: 'my-mysql-lively-mountain-1673.fly.dev',
  user: "returnhood",
  password: "returnhood@123",
  database: "returnhood",
});

db_con.connect((err) => {
  if (err) {
    console.log("Database Connection Failed !!!", err);
  } else {
    console.log("connected to Database");
  }
});

export default db_con;
