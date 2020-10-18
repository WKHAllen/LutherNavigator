import { Router } from 'express';

export var router = Router();

// Index page
router.get('/', (req, res) => {
	res.render('index');
});
