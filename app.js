const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 5050;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LGBT Agenda API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'], // Adjust path as needed
};

const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(cors());
app.use(express.json()); // for parsing JSON bodies

app.get('/', (req, res) => {
  res.send('LGBT Agenda backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

