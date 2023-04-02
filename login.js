import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import express from 'express'
import mysql from 'mysql'
const router = express.Router()


export function validateAuth (req, res, next) {
    try {
        const decode = jwt.verify(req.body.token, process.env.JWT_SECRET)
        req.usuario = decode
        next()
    } catch (error) {
        res.status(400).send("Auth fail")
    }
}

router.post('/', (req, res) => {
    
    const user = req.body
    const {connection: con} = req.info

    console.log(req.info)
    if (!user.email && !user.password) res.status(400).send('cannot login')

    con.query('SELECT * FROM users WHERE email = ?', [user.email], (err, results) => {
        if (err) res.status(500).send({title: 'server error', message: err.message})
        if (results.length < 1) res.status(401).send('Auth fail')

        bcrypt.compare(user.password, results[0].token, (err, result) => {
            if (err) res.status(401).send({title: 'Auth fail', message: err.message})
            const token = jwt.sign({
                id: results[0].id,
                email: results[0].email,
                password: results[0].token
            }, process.env.JWT_SECRET, {expiresIn: '1d'})
            res.status(200).send({
                message: "Authenticated sucessfuly",
                token
            })
        })
    })
});

export default router

