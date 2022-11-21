const express = require("express");
const cors = require("cors");
const User = require("./model/User");
const Products = require("./model/Products");
require("./db/config");

const jwt = require("jsonwebtoken");
const jwtKey= 'e-comm';

const app = express();
app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    jwt.sign({result},jwtKey,{expiresIn: "2h"},(err,token)=>{
        if(err){
            res.send({ Result: "Some Thing Went Wrong Please Try After Some Time" });
        }
        res.send({user,auth:token});
    });
})

app.post("/login", async (req, res) => {
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            jwt.sign({user},jwtKey,{expiresIn: "2h"},(err,token)=>{
                if(err){
                    res.send({ Result: "Some Thing Went Wrong Please Try After Some Time" });
                }
                res.send({user,auth:token});
            });
        } else {
            res.send({ Result: "No User Found" }); 
        }
    } else {
        res.send({ Result: "No User Found" });

    }
})

app.post("/add-product", verifyToken , async (req, res) => {
    let products = new Products(req.body);
    let result = await products.save();
    res.send(result)
})

app.get("/products", verifyToken ,  async (req, res) => {
    const products = await Products.find();
    if (products.length > 0) {
        res.send(products);
    } else {
        res.send({ Result: "No Product Found" });
    }
})

app.delete("/product/:id", verifyToken , async (req, res) => {
    let result = await Products.deleteOne({ _id: req.params.id })
    res.send(result);
})
app.get("/product/:id", verifyToken , async (req, res) => {
    let result = await Products.findOne({ _id: req.params.id })
    if (result) {
        res.send(result);
    } else {
        res.send({ Result: "No Product Found" });
    }
})
app.put("/product/:id", verifyToken , async (req, res) => {
    let result = await Products.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    )
    if (result) {
        res.send(result);
    } else {
        res.send({ Result: "No Product Found" });
    }
})

app.get("/search/:key",verifyToken, async (req, res) => {
    let result = await Products.find({
        "$or": [
            {
                name: { $regex: req.params.key }
            },{
                company: { $regex: req.params.key }
            },{
                price: { $regex: req.params.key }
            },{
                category: { $regex: req.params.key }
            }

        ]
    });
    if (result) {
        res.send(result);
    } else {
        res.send({ Result: "No Product Found" });
    }
})

function verifyToken(req,res,next){
    // console.log(req.headers['authorization']);
    let token = req.headers['authorization'];
    if(token){
        token = token.split(' ')[1];
        jwt.verify(token ,jwtKey,(err ,valid)=>{
            if(err){
                res.status(401).send({Result :"Please Provide A  Valid token"}) 
            }else{
                next();
            }
        });
        console.log(token);
    }else{
        res.status(403).send({Result :"Please Provide A token"})
    }
}

app.listen(5000, () => {
    console.log("server running at port no 5000");
})