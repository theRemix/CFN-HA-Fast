const logger = process.env.LOGGER || true
const fastify = require('fastify')({ logger })
const PORT = process.env.PORT || 3000;
const {
  AWS_REGION
} = process.env;

fastify.route({
    method: ['GET', 'HEAD'],
    url: '/',
    handler: async (request, reply) => ({
      AWS_REGION
    })
})

const start = async () => {
  try {
    await fastify.listen(PORT, '0.0.0.0')
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
