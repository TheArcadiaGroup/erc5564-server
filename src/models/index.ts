import fs from 'fs'
import path from 'path'
import * as Mongoose from 'mongoose'
const config = require('config')

// import { UserModel } from "./users/users.model";
let db: Mongoose.Connection
Mongoose.set('strictQuery', true)

let networkTocrawl = config.networkTocrawl

let linkdb = config["db"].uri[networkTocrawl]

// export const connect = () => {
//     // add your own uri below
//     const uri = linkdb;
//     if (db) {
//         return;
//     }
//     console.log("B")
//     Mongoose.connect(uri, {
//         // useNewUrlParser: true,
//         // useFindAndModify: true,
//         // useUnifiedTopology: true,
//         // useCreateIndex: true,
//     });
//     db = Mongoose.connection;
//     db.on("open", async () => {
//         console.log("Connected to database");
//     });
//     db.on("error", () => {
//         console.log("Error connecting to database");
//     });
// };
// export const disconnect = () => {
//     if (!db) {
//         return;
//     }
//     Mongoose.disconnect();
// };







export const connect = () => {

    // let db: Record<string, any> = {};
    // var db:any = {}
    //   db.prop = 5;

    // in validator node dont need store db info
    // Mongoose.Promise = global.Promise
    // mongoose.set('useCreateIndex', true)
    Mongoose.set('strictQuery', true)
    let networkTocrawl = config.networkTocrawl
    console.log(networkTocrawl)
    let linkdb = config["db"].uri[networkTocrawl]
    // let linkdbx = linkdb[networkTocrawl]
    // console.log(linkdbx)
    console.log(linkdb)
    Mongoose.connect(linkdb, {
        // useNewUrlParser: true,
        // // useFindAndModify: false,
        // useUnifiedTopology: true
    },
        (err: any) => {
            if (err) {
                console.log(err)
                console.error('Mongodb Connection error!!!')
                process.exit()
            }
        })
    db = Mongoose.connection

}
// // // import all file in this dir, except index.js
// // console.log("__dirname : ", __dirname)
// // fs.readdirSync(__dirname)
// //     .filter(function (file: string) {
// //         console.log("filezx : ", file)
// //         return (file.indexOf('.') !== 0) && (file !== 'index.ts')
// //     })
// //     .forEach(async function (file: string) {
// //         console.log("file: ", file)
// //         var model = require (path.join(__dirname, file))
// //         console.log("model: ", model)
// //         console.log("db[model.modelName] : ")
// //         db[model.modelName] = model
// //     })

// export default db
