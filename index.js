import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import http from 'http'
import path from "path"
import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express()

// app.use(express.static(path.join(__dirname, "client/dist")))
app.use(express.static("./client/dist"))
if (process.env.NODE_ENV === "production"){

    
}
// console.log(__dirname)
// console.log(path.join(__dirname, "client/dist"))

const puerto = process.env.PORT || 45561


const server = http.createServer(app)

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: `https://realtrend-challenge.herokuapp.com:${puerto}`,
        methods:['GET', 'POST']
    }
})

const candidates = {
    "voteA": 0,
    "voteB": 0
}

const products = {
    productA: {
        title:'',
        description:'',
        image:'',
        load:false
    },
    productB: {
        title:'',
        description:'',
        image:'',
        load: false
    }
}

const percentages ={
    perA: 0 ,
    perB: 0 
}

let pauseState = false


const users = []

io.on('connection', socket => {

    socket.emit('users', socket.id)

    socket.on('vote', index => {
        if(index === 0) {
            candidates.voteA += 1
        }
        if(index === 1) {
            candidates.voteB += 1
        }
        
        io.emit('vote', candidates)

    })

    socket.on('reset', () => {
        candidates.voteA = 0
        candidates.voteB = 0
        percentages.perA = 0 
        percentages.perB = 0
        products.productA = {
            title: '',
            description: '',
            image: '',
            load: false
        }
        products.productB = {
            title: '',
            description: '',
            image: '',
            load: false
        }

        io.emit('vote', candidates)
        io.emit('item', products)
        io.emit('percentage', percentages)
    })

    socket.on('pause', btnState => {
        io.emit('pause', !btnState)
    })
    

    socket.on('loadProduct', (clientProduct) => {
        const pA = products.productA
        const pB = products.productB

        if (pA.load == true) {
            pB.title = clientProduct.title
            pB.description = clientProduct.price
            pB.image = clientProduct.thumbnail
            pB.load = true
        } else {
            pA.title = clientProduct.title
            pA.description = clientProduct.price
            pA.image = clientProduct.thumbnail
            pA.load = true
        }
        
       
        io.emit('item', products)
      
    })

    socket.on('connection', () => {
        io.emit('vote',candidates)
        io.emit('item', products)
        io.emit('update', percentages)
        // console.log(socket.id, 'Connected')
    })

    socket.on('disconnect', () => {
        // console.log('User Disconnected', socket.id)
    })




})

// io.on('connection', socket => {
    
//     socket.on('send_message', data => {
//         socket.emit('receive_message', data)
//     })

// })


server.listen(puerto, () => {
    console.log(`SV running on port ${puerto}`)
})