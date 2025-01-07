const express = require('express');
const app = express();


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


}


async function dbQuery() {
    let conn;


    conn = await connection;


    const result = await conn.query(`SELECT filename,  upload_date from files;`);
   
    console.log(result);
    return result
}


app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(8888);
console.log('Server Running...');


const path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')));


var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.text());


let multer = require('multer');


//let upload = multer({ dest: './public' });


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,'./public') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  })


const upload = multer({storage: storage})




app.post('/upload', upload.single('userfile'), function(req, res){
    dbInsert(req.file.originalname)
    res.send('Uploaded! : '+ req.file.originalname);
    console.log(req.file);
});


const ejs = require('ejs');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/ejs', function(req, res){
    const title = "타이틀 입니다.";
    res.render('index', {title, count:5});
})


app.get('/show', async function(req, res){
    let data = await dbQuery();


    const title = "업로드 파일 목록";


    for (let i = 0; i < data.length; i++) {
        data[i].url = '/public/' + data[i].filename;
    }


    res.render('show', {title, data});
});


async function dbDelete(filename) {
    let conn;


    conn = await connection;


    const result = await conn.query(`DELETE FROM files WHERE filename = '${filename}';`);
   
    console.log(result);
}


const fs = require('fs');
app.get('/delete', async function(req, res) {
    const filename = req.query.filename;


    // Delete file from filesystem
    fs.unlink(path.join(__dirname, 'public', filename), async (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('File deletion failed');
            return;
        }


        // Delete file record from database
        await dbDelete(filename);
        res.redirect('/show');
    });
});
