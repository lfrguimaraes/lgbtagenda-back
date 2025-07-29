const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // for parsing JSON bodies

app.get('/', (req, res) => {
  res.send('LGBT Agenda backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});