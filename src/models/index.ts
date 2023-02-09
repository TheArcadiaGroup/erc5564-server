import fs from 'fs'
import path from 'path'
const mongoose = require('mongoose')
const db: Record<string, any> = {};
const config = require('config')

// in validator node dont need store db info
mongoose.Promise = global.Promise
// mongoose.set('useCreateIndex', true)
mongoose.set('strictQuery', true)
let networkTocrawl = config.networkTocrawl
console.log(networkTocrawl)
let linkdb = config["db"].uri[networkTocrawl]
// let linkdbx = linkdb[networkTocrawl]
// console.log(linkdbx)
console.log(linkdb)
mongoose.connect(linkdb, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
},
    (err: any) => {
        if (err) {
            console.log(err)
            console.error('Mongodb Connection error!!!')
            process.exit()
        }
    })

// import all file in this dir, except index.js
fs.readdirSync(__dirname)
    .filter(function (file: string) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach(function (file: string) {
        var model = require(path.join(__dirname, file))
        db[model.modelName] = model
    })

export default db
