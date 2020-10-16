import * as express from 'express';

const port = Number(process.env.PORT);

const app = express();

app.use(express.static('static'));

app.get('/', (req, res) => {
	res.send('<h1>Hello, world!</h1>');
});

app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

export = app;
