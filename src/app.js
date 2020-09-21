const express = require('express');
const cors = require('cors');
const { v4: uuidv4, validate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

//MIDDLEWARES
function logRequests(req, res, next) {
    const { method, url } = req;
    const logLabel = `[${method.toUpperCase()}] ${url}`;
    console.time(logLabel);
    next();
    console.timeEnd(logLabel);
}

function validadeRepoId(req, res, next) {
    const { id } = req.params;
    if(!validate(id)) return res.status(400).json({error: 'Invalid repository id!'});
    return next();
}

app.use(logRequests);

// REPOSITORIES
app.get('/repositories', (req, res) => {
    return res.json(repositories);
});

app.post('/repositories', (req, res) => {
    const { title, url, techs } = req.body;

    const repo = { id: uuidv4(), title, url, techs, likes: 0 };

    repositories.push(repo);

    return res.json(repo);
});

app.put('/repositories/:id', validadeRepoId, (req, res) => {
    const { id } = req.params;
    const { title, url, techs } = req.body;

    const repoIndex = repositories.findIndex(repo => repo.id === id);
    if (repoIndex < 0) return res.status(400).json({ error: 'Repository not found!' });

    const updateRepo = Object.assign({}, repositories[repoIndex], { title, url, techs });

    repositories[repoIndex] = updateRepo;

    return res.json(updateRepo);
});
app.delete('/repositories/:id', validadeRepoId, (req, res) => {
    const { id } = req.params;

    const repoIndex = repositories.findIndex(repo => repo.id === id);
    if (repoIndex < 0) return res.status(400).json({ error: 'Repository not found!' });

    repositories.splice(repoIndex, 1);

    return res.status(204).send();
});

// LIKES
app.post('/repositories/:id/like', validadeRepoId, (req, res) => {
    const { id } = req.params;

    const repoIndex = repositories.findIndex(repo => repo.id === id);
    if (repoIndex < 0) return res.status(400).json({ error: 'Repository not found!' });

    repositories[repoIndex].likes += 1;

    res.json(repositories[repoIndex]);
});

module.exports = app;