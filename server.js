const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Cargar variables de entorno

const User = require('./models/User');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected ⛁'))
    .catch(err => console.log(err));

// Rutas de autenticación
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const user = new User({ firstName, lastName, email, password });
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        res.status(400).send(err);
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
    } catch (err) {
        res.status(500).send(err);
    }
});
app.put('/profile', async (req, res) => {
    const { token, firstName, lastName, password } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).send('User not found');

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

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
// Middleware para proteger rutas
const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};

// Rutas para el progreso
app.get('/progress/:userId',auth, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.params.userId });
        res.json(progress);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/progress', auth,async (req, res) => {
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
app.get('/plan',auth, async (req, res) => {
    try {
        const plan = await Plan.find();
        res.json(plan);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/plan',auth, async (req, res) => {
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
    console.log(`🆗 Express Application Running on port ${process.env.PORT || port}`);
});