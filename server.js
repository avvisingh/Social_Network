const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('server up and running')
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});