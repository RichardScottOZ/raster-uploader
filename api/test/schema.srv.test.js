import fs from 'fs';
import test from 'tape';
import assert from 'assert';
import Flight from './flight.js';

const flight = new Flight();

flight.init(test);
flight.takeoff(test);

const UPDATE = process.env.UPDATE;

test('GET: api/schema', async () => {
    try {
        const res = await flight.fetch('/api/schema', {
            method: 'GET'
        }, true);

        const fixture = new URL('./fixtures/get_schema.json', import.meta.url);

        if (UPDATE) {
            fs.writeFileSync(fixture, JSON.stringify(res.body, null, 4));
        }

        assert.deepEqual(res.body, JSON.parse(fs.readFileSync(fixture)));
    } catch (err) {
        assert.ifError(err, 'no error');
    }
});

test('GET: api/schema?method=FAKE', async () => {
    try {
        const res = await flight.fetch('/api/schema?method=fake', {
            method: 'GET'
        }, false);

        assert.equal(res.status, 400, 'http: 400');

        assert.deepEqual(res.body, {
            status: 400,
            message: 'validation error',
            messages: [{
                keyword: 'enum',
                dataPath: '.method',
                schemaPath: '#/properties/method/enum',
                params: {
                    allowedValues: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']
                },
                message: 'should be equal to one of the allowed values'
            }]
        });
    } catch (err) {
        assert.ifError(err, 'no error');
    }
});

test('GET: api/schema?method=GET', async () => {
    try {
        const res = await flight.fetch('/api/schema?method=GET', {
            method: 'GET'
        }, false);

        assert.equal(res.status, 400, 'http: 400');
        assert.deepEqual(res.body, {
            status: 400,
            message: 'url & method params must be used together',
            messages: []
        });

    } catch (err) {
        assert.ifError(err, 'no error');
    }
});

test('GET: api/schema?url=123', async () => {
    try {
        const res = await flight.fetch('/api/schema?url=123', {
            method: 'GET'
        }, false);

        assert.equal(res.status, 400, 'http: 400');
        assert.deepEqual(res.body, {
            status: 400,
            message: 'url & method params must be used together',
            messages: []
        });
    } catch (err) {
        assert.ifError(err, 'no error');
    }
});

test('GET: api/schema?method=POST&url=/login', async () => {
    try {
        const res = await flight.fetch('/api/schema?method=POST&url=/login', {
            method: 'GET'
        }, true);

        const fixture = new URL('./fixtures/login_schema.json', import.meta.url);

        if (UPDATE) {
            fs.writeFileSync(fixture, JSON.stringify(res.body, null, 4));
        }

        assert.deepEqual(res.body, JSON.parse(fs.readFileSync(fixture)));
    } catch (err) {
        assert.ifError(err, 'no error');
    }
});

test('POST: api/login', async () => {
    try {
        const res = await flight.fetch('/api/login', {
            method: 'POST',
            body: {
                fake: 123,
                username: 123
            }
        }, false);

        assert.equal(res.status, 400, 'http: 400');
        assert.deepEqual(res.body, {
            status: 400,
            message: 'validation error',
            messages: [{
                keyword: 'type',
                dataPath: '.username',
                schemaPath: '#/properties/username/type',
                params: { type: 'string' },
                message: 'should be string'
            },{
                keyword: 'required',
                dataPath: '',
                schemaPath: '#/required',
                params: {
                    missingProperty: 'password'
                },
                message: 'should have required property \'password\''
            }]
        });
    } catch (err) {
        assert.ifError(err, 'no error');
    }
});

flight.landing(test);
