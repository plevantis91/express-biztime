const request = require('supertest');

const app = require('../app');
const { createData } = require('../_test-data');
const db = require('../db');
const { describe } = require('node:test');

beforeEach(createData);

afterAll(async () => { 
    await db.end();
});

describe('GET /', function () {
    test('Responds with list of companies', async function () {
        const resp = await request(app).get('/companies');
        expect(resp.body).toEqual({
            "invoices": [
                {code: 'apple', name: "Apple Computer"},
                {code: 'ibm', name: "IBM"}
            ]
        });
    });
});

describe('GET /apple', function () {
    test('Responds with company info', async function () {
        const resp = await request(app).get('/companies/apple');
        expect(resp.body).toEqual({
            "company": {
                code: 'apple',
                name: 'Apple Computer',
                description: 'Maker of OSX.',
                invoices: [1, 2]
            }
        });
    });

    test('It should return 404 for no-such-company', async function () {
        const resp = await request(app).get('/companies/blargh');
        expect(resp.status).toEqual(404);
    });
});

describe('POST /', function () {
    test(' add company', async function () {
        const resp = await request(app)
            .post('/companies')
            .send({name: 'Samsung', description: 'Maker of Galaxy'});
        
        expect(resp.body).toEqual({
            "company": {
                code: 'samsung',
                name: 'Samsung',
                description: 'Maker of Galaxy'
            }
        });
        expect(resp.status).toEqual(201);
    });
    test('It should return 500 for error', async function () {
        const resp = await request(app)
            .post('/companies')
            .send({name: 'Samsung'});
        
        expect(resp.status).toEqual(500);
    });
});

describe('PUT /:code', function () {
    test('It should update company', async function () {
        const resp = await request(app)
            .put('/companies/apple')
            .send({name: 'Apple Computer Inc.'});
        
        expect(resp.body).toEqual({
            "company": {
                code: 'apple',
                name: 'Apple Computer Inc.',
                description: 'Maker of OSX.'
            }
        });
    });

    test('It should return 404 for no-such-company', async function () {
        const resp = await request(app)
            .put('/companies/adfadsf')
            .send({name: 'adsfadsf'});
        
        expect(resp.status).toEqual(404);
    });
});

describe('DELETE /:code', function () {
    test('It should delete company', async function () {
        const resp = await request(app).delete('/companies/apple');
        expect(resp.body).toEqual({status: 'deleted'});
    });

    test('It should return 404 for no-such-company', async function () {
        const resp = await request(app).delete('/companies/adfadsf');
        expect(resp.status).toEqual(404);
    });
});

