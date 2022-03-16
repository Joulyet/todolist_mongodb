const express = require("express");
const bodyParser = require("body-parser");
const {
    v4: uuidv4,
    validate
} = require('uuid');
const app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static("public"));

const {
    ObjectId
} = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

let todolist = [{
        content: "Faire la vaisselle",
        limitDate: new Date('2022-11-12'),
        extraInfo: ""
    },
    {
        content: "Ranger la chambre",
        limitDate: new Date('2021-12-14'),
        extraInfo: ""
    },
    {
        content: "Faire les devoirs",
        limitDate: new Date('2021-11-13'),
        extraInfo: ""
    }
];

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("TODOS").count(function (err, count) {
        if (!err && count === 0) {
            dbo.collection("TODOS").insertMany(todolist, function (err, res) {
                if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                db.close();
            });
        }
    })
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html')
})

app.get("/todolist", (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("TODOS").find({}).toArray(function (err, result) {
            if (err) throw err;
            let todoByDate = result.sort((a, b) => b.limitDate - a.limitDate);
            res.status(200).send(todoByDate);
            db.close();
        });
    });
});

app.post("/todolist", (req, res) => {
    if (!(req.body.content) || !(req.body.limitDate) || !(req.body)) {
        res.status(400).send({
            error: `Données incorrectes`
        });
    } else {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");

            dbo.collection("TODOS").insertOne(req.body, function (err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
            res.status(201).send(req.body);
        });
    }
});

app.get("/todolist/:id", (req, res) => {
    const {
        id
    } = req.params;

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("TODOS").findOne({
            _id: ObjectId(id)
        }, function (err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });

});

app.put("/todolist/:id", (req, res) => {
    const {
        id
    } = req.params;
    const {
        content,
        limitDate,
        extraInfo
    } = req.body;

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("TODOS").updateOne({
            _id: ObjectId(id)
        }, {
            $set: req.body
        }, function (err, res) {
            if (err) throw err;
            db.close();
        });
        res.status(201).send(req.body);
    });
});

app.delete('/todolist/:id', (req, res) => {
    const {
        id
    } = req.params;

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("TODOS").deleteOne({
            _id: ObjectId(id)
        }, function (err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
        res.status(201).send(req.body);
    });
})

app.listen(3000);