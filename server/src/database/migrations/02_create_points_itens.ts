import Knex from 'knex';

export async function up(knex: Knex){
    return knex.schema.createTable('points_itens', table=>{
        table.increments('id').primary();
        table.integer('point_id')
        .notNullable().references('id').inTable('points');  
        table.integer('item_id')
        .notNullable().references('id').inTable('itens');  

    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('point');
}