import express from 'express'
import mysql from 'mysql'
import { Order } from './order.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import loginRoute, {validateAuth} from './login.js'

const app = express()

var connection = mysql.createConnection({
    host     : process.env.HOST,
    user     : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
  });
   
connection.connect();

app.use(express.json())
app.use('/login', (req, res, next) => {
    req.info = {connection}
    next()
}, loginRoute)
app.post('/orders', validateAuth,(req, res) => {
    let orders = []
    connection.query('SELECT * FROM orders;', (error, results, fields) => {
        if (error) res.send(error.message)
        if (results.length === 0)     
            res.status(404).send("Nothing found")

        results.forEach (({id, customer_id, order_date, total, payment_method}) => {
            let order = new Order(id, customer_id, order_date, total, payment_method);
            orders.push(order)
        })
        res.status(200).send(orders)
    })
})

app.post('/orders', (req, res) => {
    if (req.body === null || req.body === undefined)
        res.send("empty")
    const {customerId, orderDate, total, paymentMethod } = req.body

    connection.query (`INSERT INTO orders (customer_id, order_date, total, payment_method) VALUES(?,?,?,?);`,[customerId, orderDate, total, paymentMethod], (error, results) => {
        connection.release();
        if (error) res.send(error.message)
        res.status(201).send("Object created")
    })
})

app.get('/users', (req, res) => {
    connection.query('SELECT *  FROM users;', (error, results, fields) => {
        connection.release()
        if (error) res.send(error.message)
        if (results.length === 0) res.status(404).send("not found")

        let users = results.map(result => {
            let user = new User(result.id, result.name, result.email, result.token)
            return user
        })

        res.status(200).send(users)
    })
})

app.post('/users', (req, res) => {
    const user = req.body
    console.log(user)

    if (!user.name || !user.email || !user.password) {
        return res.status(400).json({message: "Invalid request."});
    }
    
    bcrypt.hash(user.password, 10, (error, hash) => {
        console.log(hash)

        connection.query('SELECT * FROM users WHERE token = ?;', [hash], (error, results) => {
            if (error) res.send(error.message)
            if (results.length === 1) res.status(400).send("invalid request")
        })

        connection.query('INSERT INTO users (name, email, token) VALUES (?, ?, ?);', [user.name, user.email, hash], (error, results) => {
            if(error) res.send(error.message)
            res.status(201).send("Object created")
        });

    })
})

app.listen(3000, () => {
    console.log('listening on port')
})
