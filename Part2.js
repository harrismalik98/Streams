// Show User Data - Pipeline - Transform 

const fs = require("fs");
const csv = require("csvtojson");
const { Transform, pipeline } = require("stream");

const readStream = fs.createReadStream("./data/import.csv");

// A Transform stream is a type of stream that takes input data,
// performs some transformation on it, and then outputs the transformed data.
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

// =================== Below one is through Pipe =================== //
// readStream.pipe(csv({delimiter: ";"}, {objectMode: true}))
// .pipe(myTransform)
// .pipe(myFilter)
// .on("data", data => {
//     console.log(data);
// })
// .on("error", error => {
//     console.error("Stream error: ", error);
// })
// .on("end", () => {
//     console.log("Stream Ended");
// })


// =================== Below one is through Pipeline =================== //

// A pipeline is a combination of multiple pipes,
// where the output of one pipe is passed as the input to the next pipe.
// Can't use events on Pipeline like "data","error", "end".

pipeline(
    readStream,
    csv({delimiter: ";"}, {objectMode: true}),
    myTransform,
    myFilter,
    (err) => {
        if(err){ console.log("Pipeline Error: " , err);}
        else{ console.log("Pipeline Finished");}
    }
)

myFilter.on("data", (data) => {
    console.log(data);
});