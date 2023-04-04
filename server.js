const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
const express = require("express");
const axios = require("axios");
const jwt = require('jsonwebtoken');
const Pokemon = require('./models/pokemon');
const User = require('./models/user');
const { connectDB } = require('./connectDB');
const { handleErr } = require('./errorHandler');
const { asyncWrapper } = require('./asyncWrapper');
const pokemonApi = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';
const port = process.env.PORT || 3000;

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

const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

// const start = asyncWrapper(async () => {
//     await connectDB({ "drop": false });

//     app.listen(port, async () => {
//         console.log(`Server running at http://localhost:${port}`);

//         // grab the pokemon data from the url
//         const pokemons = await axios.get(pokemonApi);
//         console.log("Pokemon API fetched");

//         // insert the data into the db
//         try {
//             const res = await Pokemon.insertMany(pokemons.data);
//             console.log("Pokemon inserted into db");
//         } catch (err) {
//             console.log("ERROR: Pokemon not inserted into db")
//             console.log(err);
//         }
//     });
// })
// start();

// ======================= Authenticate User =======================
const authUser = asyncWrapper(async (req, res, next) => {
    let token = "";

    try {
        token = req.header('authorization').split(" ")[1];
        console.log("token: ", token);
    } catch (err) {
        throw new PokemonAuthError("No Token: Please provide the access token using the headers.");
    }

    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified.user;
        next();
    } catch (err) {
        throw new PokemonAuthError("Invalid Token Verification. Log in again.");
    }
})

// ======================= Authenticate Admin =======================
const authAdmin = asyncWrapper(async (req, res, next) => {
    const token = req.header('authorization').split(" ")[1];
    if (!token) {
        throw new PokemonAuthError("No Token: Please provide the access token using the headers.");
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (payload?.user?.role == "admin") {
            return next();
        }
        throw new PokemonAuthError("Access denied");

    } catch (err) {
        throw new PokemonAuthError("Invalid Token Verification. Log in again.");
    }
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

app.get('/report', (req, res) => {
    console.log("Report requested");
    res.send(`Table ${req.query.id}`);
    // TODO: Implement report generation
})

app.all('*', (req, res) => {
    res.json({ errMsg: "Improper route. Check API docs plz." });
})

// app.use(handleErr);

module.exports = app;
