// Save Data to File.
// Save Data to compressed file.
// Save data to MongoDB

const fs = require("fs");
const csv = require("csvtojson");
const { Transform, pipeline } = require("stream");
const { createGzip } = require("zlib");
const User = require("./userModel");

const readStream = fs.createReadStream("./data/import.csv");


const myTransform = new Transform({
    objectMode: true,
    transform(chunck, enc, callback){
        const user = {
            name: chunck.name,
            email: chunck.email.toLowerCase(),
            age: Number(chunck.age),
            salary: Number(chunck.salary),
            isActive: Boolean(chunck.isActive)
        }
        callback(null, user);
    },
});


const myFilter = new Transform({
    objectMode: true,
    transform(user, enc, callback){
        if(!user.isActive || user.salary <1000){
            callback(null);
            return;
        }
        callback(null, user);
    }
});

// Converting to JSON beacuse creating a new file.
// We convert data to JSON because createWriteStream takes string or buffer not object.
const convertToJson = new Transform({
    objectMode: true,
    transform(user, enc, callback){
        const value = JSON.stringify(user) + '\n';
        callback(null, value);
    }
});


const saveUser = new Transform({
    objectMode: true,
    transform(user, enc, callback){
        User.create(user);
        callback(null);
    }
});

pipeline(
    readStream,
    csv({delimiter: ";"}, {objectMode: true}),
    myTransform,
    myFilter,
    // convertToJson,
    // createGzip(), //Node built-in library for compress file.
    // fs.createWriteStream("./data/export-json.gz"), // For saving file or compressed data.
    saveUser,
    (err) => {
        if(err){ console.log("Pipeline Error: " , err);}
        else{ console.log("Pipeline Finished");}
    }
)

myFilter.on("data", (data) => {
    console.log(data);
});