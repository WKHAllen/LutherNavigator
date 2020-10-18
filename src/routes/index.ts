import { Router } from 'express';
import * as services from '../services';

export var router = Router();

// Index page
router.get('/', async(req, res) => {
	const message = await services.IndexServices.getMessage();
	res.render('index', { message });
});
