const express = require("express")
const { handleErr } = require("./errorHandler.js")
const { asyncWrapper } = require("./asyncWrapper.js")
const dotenv = require("dotenv")
dotenv.config();
const User = require("./models/user");
// const RefreshTokens = require("./models/refreshToken");
const { connectDB } = require("./connectDB.js")
const cors = require("cors")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const {
    PokemonBadRequest,
    PokemonDbError,
    PokemonAuthError
} = require("./errors.js");
const Pokemon = require('./models/pokemon.js');

const app = express()

// const start = asyncWrapper(async () => {
//     await connectDB({ "drop": false });

//     app.listen(process.env.authServerPORT, async (err) => {
//         if (err)
//             throw new PokemonDbError(err)
//         else
//             console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
//         const doc = await User.findOne({ "username": "admin" })
//         if (!doc)
//             User.create({ username: "admin", password: bcrypt.hashSync("admin", 10), role: "admin", email: "admin@admin.ca" })
//     })
// })
// start();

app.use(express.json())
app.use(cors({
    exposedHeaders: ['authorization']
}))

let refreshTokens = [];
let loggedOutAccessTokens = [];

app.post('/register', asyncWrapper(async (req, res) => {
    const { username, password, email } = req.body;
    console.log(req.body);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userWithHashedPassword = { ...req.body, password: hashedPassword }

    const user = await User.create(userWithHashedPassword)
    res.send(user)
}))

app.post('/requestNewAccessToken', asyncWrapper(async (req, res) => {
    const refreshToken = req.header('authorization').split(" ")[3];
    // const refreshTokens = await RefreshTokens.find();
    if (!refreshToken) {
        throw new PokemonAuthError("No Token: Please provide a refresh token.");
    }
    if (!refreshTokens.find(elem => elem['refreshToken'] == refreshToken)) {
        console.log("token: ", refreshToken);
        console.log("refreshTokens", refreshTokens);
        throw new PokemonAuthError("Invalid Token: Please provide a valid token.")
    }
    try {
        const payload = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({ user: payload.user }, process.env.NEW_ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
        const userToken = `Bearer ${accessToken} Refresh ${refreshToken}`;

        res.header('authorization', userToken);
        res.send({ 'accessToken': accessToken });
    } catch (error) {
        throw new PokemonAuthError("Invalid Token: Please provide a valid token.");
    }
}))

app.post('/login', asyncWrapper(async (req, res) => {
    if (!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password')) {
        throw new PokemonAuthError('Invalid Payload: Please provide username and password');
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username })
    if (!user)
        throw new PokemonAuthError("User not found")

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new PokemonAuthError("Password is incorrect");
    }

    const accessToken = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '600s' });
    const refreshToken = jwt.sign({ user: user }, process.env.REFRESH_TOKEN_SECRET);

    // If the refresh token doesn't exist in the array, add it
    if (!refreshTokens.find(elem => elem['user_email'] == user.email)) {
        refreshTokens.push({ 'refreshToken': refreshToken, 'user_email': user.email });
    }

    const userToken = `Bearer ${accessToken} Refresh ${refreshToken}`;
    console.log("Logged In");
    res.header('authorization', userToken);
    res.send({ 'accessToken': accessToken, 'refreshToken': refreshToken, 'refreshTokens': refreshTokens });
}))

app.get('/logout', asyncWrapper(async (req, res) => {
    const user = await User.findOne({ token: req.query.appid })
    if (!user) {
        throw new PokemonAuthError("User not found")
    }

    try {
        const refreshToken = req.header('authorization').split(" ")[3];
        // console.log(refreshToken);
        const decodedAccessToken = jwt.decode(req.header('authorization').split(' ')[1]);

        const token = refreshTokens.find(elem => elem["refreshToken"] == refreshToken)

        if (token) {
            var idx = refreshTokens.indexOf(token);
            if (idx > -1) {
                refreshTokens.splice(idx, 1);
            }
        }
        loggedOutAccessTokens.push(decodedAccessToken);
        res.header('authorization', "");
        console.log("Logged out");
        res.send({ 'refreshTokens': refreshTokens });
    } catch (err) {
        throw new PokemonAuthError("Invalid Token: Please provide a valid token.");
    }
}))

module.exports = app;