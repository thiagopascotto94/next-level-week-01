import { Request, Response} from 'express';
import knex from '../database/connection';

class ItensContrller {
    async index(request: Request, response: Response) {
        const items = await knex('itens').select('*');

        const serializedItens = items.map((item) => {
            item['image_url'] = `http://192.168.25.198:3333/uploads/${item.image}`;
            return item;
        })
        response.json(serializedItens);
    }
}

export default ItensContrller;