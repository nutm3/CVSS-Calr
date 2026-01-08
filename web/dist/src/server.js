const express = require('express');
const path = require('path');
const multer = require('multer');
const { calculateScore } = require('./cvss_core');
const { analyzeWithHeuristic } = require('./agent/heuristic');

const app = express();
const PORT = process.env.PORT || 9112;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/api/calculate', (req, res) => {
    const { vector } = req.body;
    if (!vector) return res.status(400).json({ error: "No vector provided" });

    try {
        const result = calculateScore(vector);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/analyze', upload.single('writeup'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const content = req.file.buffer.toString('utf8');
    const vectorString = analyzeWithHeuristic(content);
    const calculation = calculateScore(vectorString);

    res.json({
        vector: vectorString,
        data: calculation,
        analysis: "Heuristic Pattern Matching Complete."
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CVSSCalr v1.0] Server running on port ${PORT}`);
});
