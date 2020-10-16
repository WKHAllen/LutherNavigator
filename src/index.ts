import * as express    from 'express';
import * as hbs        from 'express-handlebars';
import * as enforce    from 'express-sslify';
import * as bodyParser from 'body-parser';

// Environment variables
const debug = Boolean(Number(process.env.DEBUG));
const port  = Number(process.env.PORT);

// Create express app
const app = express();

// Enforce HTTPS
if (!debug) {
	app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Use view engine
app.engine('.html', hbs({
    extname:       '.html',
    defaultLayout: 'default'
}));
app.set('view engine', '.html');

// Request body parsing
app.use(bodyParser.urlencoded({ extended: true }));

// Include static directory for css and js files
app.use(express.static('static'));

// Routes
app.get('/', (req, res) => {
	res.render('index');
});

// Listen for connections
app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

export = app;
