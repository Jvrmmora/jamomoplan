const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/jamomo-plan';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const planSchema = new mongoose.Schema({
    week: String,
    days: [String]
});

const Plan = mongoose.model('Plan', planSchema);

const plan = [
    {
        week: "Semana 1: Reflexión y Preparación",
        days: [
            "Día 1: Escribe tus motivaciones para dejar la pornografía.",
            "Día 2: Define metas a corto plazo.",
            "Día 3: Identifica tus desencadenantes.",
            "Día 4: Elige actividades alternativas.",
            "Día 5: Comparte tus objetivos con un amigo o familiar.",
            "Día 6: Establece un horario diario.",
            "Día 7: Dedica tiempo a la meditación o mindfulness."
        ]
    },
    {
        week: "Semana 2: Implementación y Primeros Logros",
        days: [
            "Día 8: Inicia tu primera semana sin pornografía.",
            "Día 9: Practica la técnica de mindfulness.",
            "Día 10: Realiza una actividad alternativa.",
            "Día 11: Reflexiona sobre cómo te sientes sin pornografía.",
            "Día 12: Recurre a tus estrategias alternativas.",
            "Día 13: Evalúa tu progreso.",
            "Día 14: Haz un repaso de la semana."
        ]
    },
    {
        week: "Semana 3: Profundización y Ajustes",
        days: [
            "Día 15: Establece nuevas metas para la próxima semana.",
            "Día 16: Investiga sobre grupos de apoyo.",
            "Día 17: Continúa con la práctica de mindfulness.",
            "Día 18: Reflexiona sobre tus desencadenantes.",
            "Día 19: Comparte tus avances con un amigo o familiar.",
            "Día 20: Realiza una actividad nueva.",
            "Día 21: Evalúa cómo te has sentido durante las últimas semanas."
        ]
    },
    {
        week: "Semana 4: Consolidación y Celebración",
        days: [
            "Día 22: Inicia otra semana sin pornografía.",
            "Día 23: Reflexiona sobre lo que te ha resultado más útil.",
            "Día 24: Haz un seguimiento de cualquier recaída o tentación.",
            "Día 25: Revisa tus metas y ajustes.",
            "Día 26: Planifica una actividad especial para celebrar tu progreso.",
            "Día 27: Dedica un tiempo a la meditación.",
            "Día 28: Revisa y ajusta tu plan de largo plazo."
        ]
    },
    {
        week: "Finalizando el Mes",
        days: [
            "Día 29: Establece tus metas para el próximo mes.",
            "Día 30: Celebra tus logros y reconoce tu esfuerzo."
        ]
    }
];

Plan.insertMany(plan)
    .then(() => {
        console.log('Plan inserted');
        mongoose.connection.close();
    })
    .catch(err => console.log(err));