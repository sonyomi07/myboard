const mariadb = require('mariadb');
const connection = mariadb.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'master',
    database: 'myboard'
});


async function dbInsert(filename) {
    let conn;


    conn = await connection;


    const result = await conn.query(`INSERT INTO files (filename) VALUES ('${filename}');`);
   
    console.log(result);


    await conn.end();
}


dbInsert(req.file.originalname)