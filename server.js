const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Cargar variables de entorno

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Esquema y modelo de progreso
const progressSchema = new mongoose.Schema({
    userId: String,
    completionStatus: [Boolean]
});

const Progress = mongoose.model('Progress', progressSchema);

// Esquema y modelo del plan
const planSchema = new mongoose.Schema({
    week: String,
    days: [String]
});

const Plan = mongoose.model('Plan', planSchema);

// Rutas para el progreso
app.get('/progress/:userId', async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.params.userId });
        res.json(progress);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/progress', async (req, res) => {
    const { userId, completionStatus } = req.body;
    try {
        let progress = await Progress.findOne({ userId });
        if (progress) {
            progress.completionStatus = completionStatus;
        } else {
            progress = new Progress({ userId, completionStatus });
        }
        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Rutas para el plan
app.get('/plan', async (req, res) => {
    try {
        const plan = await Plan.find();
        res.json(plan);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/plan', async (req, res) => {
    const { week, days } = req.body;
    try {
        const newPlan = new Plan({ week, days });
        await newPlan.save();
        res.json(newPlan);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});