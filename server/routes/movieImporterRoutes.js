import express from 'express';
import { importMovie } from '../controllers/movieImporterController.js';

const router = express.Router();

router.post('/import', importMovie);

export default router;
