import knex from '../database/connection'; 
import { Request, Response} from 'express';

class PointsController{

    async index(request: Request, response:  Response){
        const { city, uf, itens } = request.query;

        const parsedItens = String(itens)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('points')
        .join('points_itens', 'points.id', '=', 'points_itens.point_id')
        .whereIn('points_itens.item_id', parsedItens)
        .where('points.city', String(city))
        .where('points.uf', String(uf))
        .distinct().select('points.*');
        
        const serializedItens = points.map((point) => {
            point['image_url'] = `http://192.168.25.198:3333/uploads/${point.image}`;
            return point;
        })

        return response.json(points);
    }
    async show( request: Request, response:  Response){
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: "Point not found"});
        }

        const itens = await knex('itens')
        .join('points_itens', 'itens.id', '=', 'points_itens.item_id')
        .where('points_itens.point_id', id)
        .select('itens.title');

        point['image_url'] = `http://192.168.25.198:3333/uploads/${point.image}`;


        return response.json({ point, itens});
    }

    async create (request: Request, response: Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            itens
        } = request.body;
    
        const trx = await knex.transaction();
        
        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointsItens = itens.split(',')
        .map((item: String) => Number(item.trim()))
        .map( (item_id: Number) => {
            return{
                item_id,
                point_id
            };
        });
    
        await trx('points_itens').insert(pointsItens);
        
        await trx.commit();

        

        return response.json({ 
            id: point_id,
            ...point
        });
    }
}

export default PointsController;