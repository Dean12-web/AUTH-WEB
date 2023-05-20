var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectId

router.get('/',async (req,res,next)=>{
    try {
        const db = req.app.locals.db
        const collection = db.collection('employees')
        const result = await collection.find().toArray();
        res.json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({error : "Error get the data"});
    }
})

router.post('/', async (req,res,next)=>{
    const {nip,name,gender} = req.body
    if(!nip || !name || !gender){
        res.status(400).json({error: "NIP, Name, and Gender are required"})
    }
    try {
        const db = req.app.locals.db
        const collection = db.collection('employees')
        const result = await collection.insertOne({nip : nip, name: name, gender : gender})
        res.json(result)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({error:"Error Creating Employees"})
    }
})

router.put('/:id',async (req,res,next)=>{
    const {id} = req.params
    const {nip,name, gender} = req.body
    try {
        const db = req.app.locals.db
        const collection = db.collection('employees')
        const result = await collection.updateMany({_id: new ObjectID(id)},{
            $set : {nip: nip, name: name, gender : gender}})
        res.json(result)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({error: "Error Updating Employees data"})
    }
})

router.delete('/:id', async (req,res,next)=>{
    try {
        const {id} = req.params
        const db = req.app.locals.db
        const collection = db.collection('employees')
        const result = await collection.deleteOne({id : new ObjectID(id)})
        res.json(result)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({error : "Error Deleting the data"})
    }
})
module.exports = router