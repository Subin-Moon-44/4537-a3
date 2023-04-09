const express = require("express")
const { handleErr } = require("./errorHandler.js")
const { asyncWrapper } = require("./asyncWrapper.js")
const dotenv = require("dotenv")
dotenv.config();
const User = require("./models/user");
const { connectDB } = require("./connectDB.js")
const cors = require("cors")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const {
    PokemonBadRequest,
    PokemonDbError,
    PokemonAuthError
} = require("./errors.js");
const { useColorModeValue } = require('@chakra-ui/react');

const app = express()

const start = asyncWrapper(async () => {
    await connectDB({ "drop": false });

    app.listen(process.env.authServerPORT, async (err) => {
        if (err)
            throw new PokemonDbError(err)
        else
            console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
    })
})
start();

app.use(express.json())
app.use(cors())

app.post('/register', asyncWrapper(async (req, res) => {
    const { username, password, email } = req.body;
    console.log(req.body);
    const salt = await bcrypt.genSalt(10);
    const existedUser = await User.findOne({ username: username });

    if (existedUser) {
        throw new PokemonBadRequest("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, salt);
    const userWithHashedPassword = { ...req.body, password: hashedPassword, appid: "PLACEHOLDER" };
    let user = await User.create(userWithHashedPassword);
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    user = await User.findOneAndUpdate({ _id: user._id }, { $set: { appid: token } }, { new: true });
    res.send(user)
}))

app.post('/login', asyncWrapper(async (req, res) => {
    if (!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password')) {
        throw new PokemonAuthError('Invalid Payload: Please provide username and password');
    }

    const { username, password } = req.body;
    let user = await User.findOne({ username })
    if (!user)
        throw new PokemonAuthError("User not found")

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new PokemonAuthError("Password is incorrect");
    }

    user = await User.findOneAndUpdate({_id: user._id}, {$set: {isAuthenticated: true}}, {new: true});
    res.header('auth-token', user.token);
    res.send(user);
}))

app.post('/logout', asyncWrapper(async (req, res) => {
    const appid = req.body.appid;
    const verified = await User.findOne({appid});
    if (!verified) {
        throw new PokemonAuthError("Invalid token")
    } else {
        await User.findOneAndUpdate({appid: appid}, {$set: {isAuthenticated: false}}, {new: true})
        res.json({status: "OK", message: "Logged out"})
    }
}))

app.use(handleErr);