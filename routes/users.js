var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { route } = require('../app');
const saltRounds = 10

module.exports = (pool)=>{
  /* GET users listing. */
  router.get('/', function(req, res, next) {
    pool.query('SELECT * FROM users', (err,data)=>{
      if(err){
        return res.json({
          success: false,
          message : err.message
        })
      };
      res.json({
          success : true,
          data : data.rows
        })
    });
  });

  router.post('/', function(req, res, next) {

    const{email, password} = req.body
    //returning * untuk balikin / munculin data yang dikirim
    const hash = bcrypt.hashSync(password, saltRounds);
    pool.query('INSERT INTO users VALUES($1,$2) returning *', [email, hash], (err,data)=>{
      if(err){
        return res.json({
          success: false,
          message : err.message
        })
      };
      res.json({
          success : true,
          data : data.rows
        })
    });
  });

  router.put('/:email', function(req, res, next) {
    // const{email:emailid} = req.params
    const{email} = req.body
    //returning * untuk balikin / munculin data yang dikirim
    pool.query('UPDATE users SET email =  $1 WHERE email = $2 returning *', [email, req.params.email], (err,data)=>{
      if(err){
        return res.json({
          success: false,
          message : err.message
        })
      };
      res.json({
          success : true,
          data : data.rows
        })
    });
  });

  router.delete('/:email', function(req, res, next) {
    // const{email:emailid} = req.params
    const{email} = req.params
    //returning * untuk balikin / munculin data yang dikirim
    pool.query('DELETE FROM users WHERE email = $1 returning *', [email], (err,data)=>{
      if(err){
        return res.json({
          success: false,
          message : err.message
        })
      };
      res.json({
          success : true,
          data : data.rows
        })
    });
  });

  

  return router
}



