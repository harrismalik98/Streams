// Introduction to Read/Write Streams and pipes.

const fs = require("fs");
const { buffer } = require("stream/consumers");


const readStream = fs.createReadStream("./data/import.csv");
const writeStream = fs.createWriteStream("./data/export.csv");


// buffer is a temporary storage area in memory that holds binary data. Default size of buffer is 64kb.
// But we can increase the size of buffer using {highWaterMark:90000}

// readStream.on("data", (buffer) =>{
//     console.log(buffer);
// });


// pipe is a method used to transfer data between two streams.
readStream.pipe(writeStream); 

readStream.on("end", () => {
    console.log("Read Stream End");
});

writeStream.on("finish", () => {
    console.log("Write Stream Finished");
});