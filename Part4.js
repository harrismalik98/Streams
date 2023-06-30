// MongoDB Performance Tuninng
// Previous saving one user at a time. Now saving all users together in an array. Making array of objects.

const fs = require("fs");
const csv = require("csvtojson");
const { Transform, pipeline } = require("stream");
const { createGzip } = require("zlib");
const User = require("./userModel");
const bufferingObjectStream = require("buffering-object-stream");


const readStream = fs.createReadStream("./data/import.csv");


const myTransform = new Transform({
    objectMode: true,
    transform(chunck, enc, callback){
        const user = {
            name: chunck.name,
            email: chunck.email.toLowerCase(),
            age: Number(chunck.age),
            salary: Number(chunck.salary),
            isActive: chunck.isActive === "true"
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


// We convert data to JSON because createWriteStream takes string or buffer not object.
const convertToJson = new Transform({
    objectMode: true,
    transform(user, enc, callback){
        const value = JSON.stringify(user) + '\n';
        callback(null, value);
    }
});


const saveUsers = new Transform({
    objectMode: true,
    transform(users, enc, callback){
        const promises = users.map(user => User.create(user));
        Promise.all(promises);
        
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
    // fs.createWriteStream("./data/export-json.gz"), // For saving compressed data.
    bufferingObjectStream(10), //It adds 10 object at a time in an array.
    saveUsers,
    (err) => {
        if(err){ console.log("Pipeline Error: " , err);}
        else{ console.log("Pipeline Finished");}
    }
)

// myFilter.on("data", (data) => {
//     console.log(data);
// });