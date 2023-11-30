const express = require('express');
const app = express();

const PORT = process.env.PORT || 8000; 
const routes = require("./routes");

app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send({
    message: "Welcome to JKT48 Showroom Wrapped"
  });
});
