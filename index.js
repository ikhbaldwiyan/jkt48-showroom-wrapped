const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 8000; 
const routes = require("./routes");

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send({
    message: "Welcome to JKT48 Showroom Wrapped"
  });
});

app.use('/', routes);

app.all('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
