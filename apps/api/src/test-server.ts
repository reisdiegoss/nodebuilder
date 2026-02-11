import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/ping', async () => {
    return { pong: true };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 Ping server ready');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
