import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';

import { errors } from 'celebrate';

const app = express();

//npm i @types/cors -D
app.use(cors());
app.use(express.json());
app.use(routes);

// Rota: Endereço completo da requisição
// Recurso: Entidade que está sendo acessada

// GET: Buscar uma ou mais informações do Backend
// POST: Criar uma nova informação no Backend
// PUT: Atualizar informação existente
// DELETE: Remover informação do Backend

// Request Parm: Parametros que vem na rota que identificam um recurso
// query Parm: parametros que vem na rota e geralmente são opcionais para filtros e paginações
// Request Body: Parametros para criação/atualização de informações


app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());
app.listen(3333);