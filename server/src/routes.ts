//Comunidade cria no padrão:
// index: Listar todos os itens
// show: Exibir unico registro
// create: Ciar registro
// update : Atualizar registro
// delete : Excluir registro

import express from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ItensController from './controllers/ItensController';
import { celebrate, Joi } from 'celebrate';

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itensController = new ItensController();

routes.get('/itens', itensController.index);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);


routes.post(
    '/points', 
    upload.single('image'), 
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            item: Joi.string().required(),
        })
    },{
        abortEarly: false
    }),
    pointsController.create)

export default routes;