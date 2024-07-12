const requst = require('supertest');

const app = require('../app');
const { createData } = require('../_test-data');
const db = require('../db');
const { describe } = require('node:test');


beforeEach(createData);

afterAll(async () => {
    await db.end();
});

describe('GET /', function () {
    test('It should respond with list of invoices', async function () {
        const resp = await request(app).get('/invoices');
        expect(resp.body).toEqual({
            "invoices": [
                {id: 1, comp_code: "apple"},
                {id: 2, comp_code: "apple"},
                {id: 3, comp_code: "ibm"},
            ]
        });
    });
});

describe('GET /1', function () {
    test('It should return invoice info of specify id', async function () {
        const resp = await request(app).get('/invoices/1');
        expect(resp.body).toEqual({
            "invoice": {
                id: 1,
                amt: 100,
                add_date: '',
                paid: false,
                paid_date: expect.any(String),
                company: {
                    code: 'apple',
                    name: 'Apple',
                    description: 'Maker of OSX.'
                }
            }
        });
    });

    test('It should return 404 for no-such-invoice', async function () {
        const resp = await request(app).get('/invoices/999');
        expect(resp.status).toEqual(404);
    });
});

describe('POST /', function () {
    test('It should add a new invoice', async function () {
        const resp = await request(app)
            .post('/invoices')
            .send({comp_code: 'ibm', amt: 200});
        expect(resp.body).toEqual({
            "invoice": {
                id: 4,
                comp_code: 'ibm',
                amt: 200,
                add_date: expect.any(String),
                paid: false,
                paid_date: null
            }
        });
    });
});

describe('PUT /1', function () {
    test('It should update an invoice', async function () {
        const resp = await request(app)
            .put('/invoices/1')
            .send({amt: 500, paid: true});
        expect(resp.body).toEqual({
            "invoice": {
                id: 1,
                comp_code: 'apple',
                amt: 500,
                add_date: expect.any(String),
                paid: true,
                paid_date: expect.any(String)
            }
        });
    });

    test('It should return 404 for no-such-invoice', async function () {
        const resp = await request(app)
            .put('/invoices/999')
            .send({amt: 500, paid: true});
        expect(resp.status).toEqual(404);
    });

    test('It should return 500 for missing data', async function () {
        const resp = await request(app)
            .put('/invoices/1')
            .send({});
        expect(resp.status).toEqual(500);
    });
});

describe('DELETE /', function () {
    test('It should delete an invoice', async function () {
        const resp = await request(app).delete('/invoices/1');
        expect(resp.body).toEqual({status: 'deleted'});
    });

    test('It should return 404 for no-such-invoice', async function () {
        const resp = await request(app).delete('/invoices/999');
        expect(resp.status).toEqual(404);
    });
}); 
