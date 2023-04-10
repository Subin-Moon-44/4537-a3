const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
const express = require("express");
const axios = require("axios");
const jwt = require('jsonwebtoken');
const Pokemon = require('./src/models/pokemon');
const User = require('./src/models/user');
const { connectDB } = require('./connectDB');
const { getTypes } = require('./getTypes');
const { handleErr } = require('./errorHandler');
const { handleReq } = require("./logHandler.js");
const { asyncWrapper } = require('./asyncWrapper');
const pokemonApi = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';
const port = process.env.appServerPORT || 8080;

const {
    PokemonBadRequest,
    PokemonBadRequestMissingID,
    PokemonBadRequestMissingAfter,
    PokemonDbError,
    PokemonNotFoundError,
    PokemonDuplicateError,
    PokemonNoSuchRouteError,
    PokemonAuthError
} = require("./errors.js");

const requestLog = require('./requestLog.js');
const errorLog = require('./errorLog.js');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
var pokeModel = null;

const cors = require('cors');
app.use(cors());

const start = asyncWrapper(async () => {
    await connectDB();

    app.listen(port, async () => {
        console.log(`Server running at http://localhost:${port}`);

        // grab the pokemon data from the url
        const pokemons = await axios.get(pokemonApi);
        console.log("Pokemon API fetched");

        // insert the data into the db
        try {
            const res = await Pokemon.insertMany(pokemons.data);
            console.log("Pokemon inserted into db");
        } catch (err) {
            console.log("ERROR: Pokemon not inserted into db")
            console.log(err);
        }
    });
})
start();

app.use(express.json());
app.use(handleReq);

// ======================= Authenticate User =======================
const authUser = asyncWrapper(async (req, res, next) => {
    const token = req.query.appid;
    if (!token) {
        throw new PokemonBadRequest("Access Denied");
    }
    try {
        const verifiedUser = await User.findOne({ appid: token })
        if (!verifiedUser || !verifiedUser.isAuthenticated) {
            throw new PokemonBadRequest("User is not authenticated")
        }
        next()
    } catch (err) {
        throw err;
    }
})

// ======================= Authenticate Admin =======================
const authAdmin = asyncWrapper(async (req, res, next) => {
    const appid = req.query.appid
    const user = await User.findOne({ appid: appid })
    if (!user || !user.role == 'admin') {
        throw new PokemonBadRequest("Access denied")
    }
    next()
})

app.get('/', async (req, res) => {
    try {
        const msg = "Hi!";
        res.status(200).json({ msg: msg });
    } catch (erro) {
        res.status(500).json({ errMsg: "Error: Failed to open the page" });
    }
})

// ======================= User Only =======================
app.use(authUser);
app.get('/api/v1/all/', async (req, res) => {
    try {
        let pokemons = await Pokemon.find().exec();
        res.status(200).json(pokemons);
    } catch (err) {
        res.status(500);
        res.json({ errMsg: 'Error: Invalid query' });
    }
})

app.get('/api/v1/pokemons', async (req, res) => {
    try {
        let pokemons = await Pokemon.find();
        let after = req.query.after || 0;
        let count = req.query.count || 10;
        // console.log(after, count);

        pokemons = Pokemon.find({}).skip(after).limit(count).exec((err, filtered) => {
            if (err) {
                console.log(err);
            } else {
                console.log(filtered.length);
                res.status(200).json(filtered);
            }
        })

    } catch (err) {
        res.status(500);
        res.json({ errMsg: "Error: Invalid query" });
    }
})

// Get a pokemon by id
app.get('/api/v1/pokemon/:id', async (req, res) => {
    try {
        const pokemonId = req.params.id;
        const query = {};
        if (!isNaN(pokemonId)) {
            query["id"] = pokemonId;
        } else {
            return res.status(500).json({ errMsg: "Invalid query" });
        }
        const jsonData = await Pokemon.findOne(query);
        if (!jsonData) {
            return res.status(400).json({ errMsg: "Pokemon not found" })
        }
        res.status(200).json([jsonData]);
    } catch (err) {
        res.status(500);
        res.json({ errMsg: "Error: Invalid query" });
    }
})

// Get a pokemon Image URL
app.get('/api/v1/pokemonImage/:id', (req, res) => {
    try {
        const pokemonId = req.params.id;
        if (!isNaN(pokemonId)) {
            if (pokemonId > 809 || pokemonId < 1) {
                return res.status(500).json({ errMsg: "Invalid query" });
            }
            if (parseInt(id) < 10) {
                id = "00" + id;
            } else if (parseInt(id) < 100) {
                id = "0" + id;
            }
            let imageLink = "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/" + req.params.id + ".png";
            res.status(200).json(imageLink);
        } else {
            return res.status(500).json({ errMsg: "Invalid query" });
        }
    } catch (err) {
        res.status(500);
        res.json({ errMsg: `${err.name ? err.name + ": " : ""}${err.message}` });
    }
});

// ======================= Admin Only =======================
app.use(authAdmin);

// Get reports according to the report id
app.get('/api/v1/report/:reportid', asyncWrapper(async (req, res) => {
    const reportId = req.params.reportid;
    switch (reportId) {
        // Unique API users over a period of time
        case "1":
            // last 24 hours
            const filter = {
                date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }

            const docs = await requestLog.find(filter).sort({ date: -1 }).limit(1000);
            const uniqueUsers = [...new Set(docs.map(doc => doc.username))];
            const userUsage = uniqueUsers.map((user, index) => {
                return {
                    index: index + 1,
                    user: user,
                    endpoint: docs.find(doc => doc.username == user).endpoint
                }
            })
            userUsage.sort((a, b) => a.index.localeCompare(b.index));
            res.json(userUsage);
            break;
        // Top API users over period of time
        case "2":
            const docs2 = await requestLog.find().sort({ date: -1 }).limit(1000)
            const uniqueUsers2 = [...new Set(docs2.map(doc => doc.username))]
            // count number of requests for each user
            const userUsage2 = uniqueUsers2.map((user, index) => {
                return {
                    index: index + 1,
                    user: user,
                    count: docs2.filter(doc => doc.username == user).length
                }
            })
            userUsage2.sort((a, b) => b.content - a.content);
            res.json(userUsage2);
            break;
        case "3":
            // Top Users for each API endpoint
            const docs3 = await requestLog.find().sort({ date: -1 }).limit(1000)
            const endpointList3 = [...new Set(docs3.map(doc => doc.endpoint))]
            const endpointUsage3 = endpointList3.map(endpoint => {
                const userList = docs3.filter(doc => doc.endpoint === endpoint).map(doc => doc.username)
                const uniqueUsers = [...new Set(userList)]
                const userCount = uniqueUsers.map(user => {
                    return {
                        username: user,
                        count: userList.filter(u => u === user).length
                    }
                })
                return {
                    index: endpoint,
                    content: userCount.sort((a, b) => b.count - a.count)[0].username
                }
            })
            res.json(endpointUsage3)
            break;
        case "4":
            // 4xx Errors list
            const docs4 = await errorLog.find().sort({ date: -1 }).limit(1000)
            // filter out 4xx errors
            const errorList = docs4.filter(doc => doc.errorStatus >= 400 && doc.errorStatus < 500)
            // construct return object with index and content
            const response = errorList.map(error => {
                return {
                    index: error.endpoint,
                    content: error.errorStatus + " - " + (error.errorMessage === "" || error.errorMessage === undefined ? "No message" : error.errorMessage)
                }
            })
            res.json(response)
            break;
        case "5":
            // recent 4xx/5xx errors
            const docs5 = await errorLog.find().sort({ date: -1 }).limit(1000)
            // filter out 4xx 5xx errors
            const errorList5 = docs5.filter(doc => doc.errorStatus >= 400 && doc.errorStatus < 600)
            // construct return object with index and content
            const response5 = errorList5.map(error => {
                return {
                    index: `${error.date.getFullYear()}-${error.date.getMonth() + 1}-${error.date.getDate()} ${error.date.getHours()}:${error.date.getMinutes()}`,
                    content: error.errorStatus + " - " + error.endpoint
                }
            })
            res.json(response5)
            break;
    }
}))

// Create a new pokemon
app.post('/api/v1/pokemon', async (req, res) => {
    // Check duplicates
    const idExists = await Pokemon.findOne({ id: req.body.id });

    if (idExists) {
        return res.status(400).json({ errMsg: "Pokemon already exists" });
    } else {
        await Pokemon.insertMany(req.body, (err, newPokemons) => {
            if (err) return res.status(400).send(err);
            res.status(201).json({ newPokemon: newPokemons, msg: "Pokemon created successfully" });
        })
    }
})

// Upsert a whole pokemon document
app.put('/api/v1/pokemon/:id', async (req, res) => {
    try {
        const pokemonId = req.params.id;
        console.log(req.body);
        const dataBody = req.body;
        if (!dataBody) {
            return res.status(500).json({ errMsg: "Body data is not provided" });
        }

        const query = {};
        if (!isNaN(pokemonId)) {
            query["id"] = pokemonId;
        } else {
            return res.status(500).json({ errMsg: "Invalid query" });
        }

        const result = await Pokemon.findOneAndUpdate(query, { $set: dataBody }, { upsert: true, new: true, returnOriginal: false });
        res.json({ updated: result, msg: "Updated successfully" });
    } catch (err) {
        res.status(500);
        res.json({ errMsg: `${err.name ? err.name + ": " : ""}${err.message}` });
    }
})

// Patch a pokemon document or a portion of the pokemon document
app.patch('/api/v1/pokemon/:id', async (req, res) => {
    try {
        const pokemonId = req.params.id;
        console.log(req.body);
        const dataBody = req.body;
        if (!dataBody) {
            return res.status(500).json({ errMsg: "Body data is not provided" });
        }

        const query = {};
        if (!isNaN(pokemonId)) {
            query["id"] = pokemonId;
        } else {
            return res.status(500).json({ errMsg: "Invalid query" });
        }

        const result = await Pokemon.findOneAndUpdate(query, { $set: dataBody }, { new: true, returnOriginal: false });
        if (!result) {
            return res.status(400).json({ errMsg: "Pokemon not found" })
        }
        res.json({ updated: result, msg: "Updated successfully" });
    } catch (err) {
        res.status(500);
        res.json({ errMsg: `${err.name ? err.name + ": " : ""}${err.message}` });
    }
})

// Delete a pokemon
app.delete('/api/v1/pokemon/:id', async (req, res) => {
    try {
        const pokemonId = req.params.id;
        const query = {};
        if (!isNaN(pokemonId)) {
            query["id"] = pokemonId;
        } else {
            return res.status(500).json({ errMsg: "Invalid query" });
        }
        const pokemon = await Pokemon.deleteOne(query);
        console.log(pokemon);
        if (pokemon.acknowledged && pokemon.deletedCount === 1) {
            res.json({ deletedId: pokemonId, msg: "Pokemon deleted successfully" });
        } else {
            return res.status(400).json({ errMsg: "Pokemon not found" });
        }
    } catch (err) {
        res.status(500).json({ errMsg: "Error: Invalid query" });
    }
})

app.all('*', (req, res) => {
    res.json({ errMsg: "Improper route. Check API docs plz." });
})

// app.use(handleErr);

module.exports = app;
