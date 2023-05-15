const { error } = require('console');
var express = require('express');
var router = express.Router();
var path = require('path');
const { isLoggedIn } = require('../helpers/util');
const bcrypt = require('bcrypt');
const saltRounds = 10

const data = [
  { nama: 'Gema', alamat: 'Cileunyi' },
  { nama: 'Fahmi', alamat: 'Permata Biru' },
  { nama: 'Rifqi', alamat: 'Jakarta' }
]

module.exports = (pool) => {
  /* GET home page. */
  router.get('/', isLoggedIn, (req, res) => {
    res.render('index', { title: "Express", data, user: req.session.user })
  })

  router.get('/login', (req, res) => {
    res.render('login', { info: req.flash('info') })
  })

  router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
      console.log(rows)
      if (rows.length == 0) {
        req.flash('info', "users doesn't exits")
        return res.redirect('/login')
      }
      if (!bcrypt.compareSync(password, rows[0].passwod)) {
        req.flash('info', "password is wrong")
        return res.redirect('/login')
      }
      req.session.user = rows[0]

      res.redirect('/')
    } catch (e) {
      res.send("Gagal Login")
    }

    res.render('login')
  })

  router.get('/logout', (req, res, next) => {
    req.session.destroy(function (err) {
      // cannot access session here
      res.redirect('/login')
    })
  })

  router.get('/register', (req, res) => {
    res.render('register')
  })

  router.post('/register', async (req, res) => {
    const { email, password, repassword } = req.body
    // query binding bertujuan untuk menghindari sql injection eg. pakai $1,[email]
    try {
      console.log(email)
      console.log(password, repassword)
      if (password !== repassword) return res.send("Password doesn't Match")
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
      // console.log(rows)
      if (rows.length > 0) return res.send('user is exist')

      const hash = bcrypt.hashSync(password, saltRounds);
      await pool.query('INSERT INTO users VALUES($1,$2)', [email, hash])

      res.redirect('/login')
    } catch (e) {
      res.send('gagal')
    }
  })
  router.get('/tambah', (req, res) => {
    res.render('add')
  })
  router.post('/tambah', (req, res) => {
    data.push({ nama: req.body.nama, alamat: req.body.alamat })
    res.redirect('/')
  })

  router.get('/edit/:id', (req, res) => {
    const id = req.params.id //Untuk menangkap ID
    // data.push({nama:req.body.nama, alamat:req.body.alamat})
    res.render('edit', { item: data[id] })
  })

  router.post('/edit/:id', (req, res) => {
    const id = req.params.id //Untuk menangkap ID
    data[id] = { nama: req.body.nama, alamat: req.body.alamat }
    res.redirect('/')
  })

  router.get('/upload/:id', (req, res) => {
    res.render('upload')
  })
  router.post('/upload/:id', function (req, res) {
    const id = req.params.id //Untuk menangkap ID
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
    let fileName = Date.now() + '-' + sampleFile.name;
    // date.now digunakan saat upload file agar tidak bentrok antar file
    let uploadPath = path.join(__dirname, '..', 'public', 'images', fileName);

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function (err) {
      if (err)
        return res.status(500).send(err);
      data[id] = { ...data[id], fileName }
      res.redirect('/');
    });
  });

  return router
}


// module.exports = router;
