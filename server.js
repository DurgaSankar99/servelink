// Load the Fastify tool
const fastify = require('fastify')({ logger: true });

// ============================================
// THE ATTENDANCE BOOK 📖
// ============================================
const services = [];

// ============================================
// 1. Homepage
// ============================================
fastify.get('/', async (request, reply) => {
  return { message: 'Hello! Servelink is alive! 🎉' };
});

// ============================================
// 2. REGISTER — an app says "I'm here!"
// ============================================
fastify.post('/register', async (request, reply) => {
  const { name, address } = request.body;

  if (!name || !address) {
    return reply.status(400).send({ 
      error: 'Please give both name and address!' 
    });
  }

  const newService = {
    id: services.length + 1,
    name: name,
    address: address,
    registeredAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),  // 🆕 just registered = alive!
    status: 'healthy'                          // 🆕
  };

  services.push(newService);

  return reply.status(201).send({
    message: `Welcome, ${name}! You are registered. ✅`,
    service: newService
  });
});

// ============================================
// 3. HEARTBEAT — an app says "Still here!" 💓  🆕 NEW!
// ============================================
fastify.post('/heartbeat/:id', async (request, reply) => {
  const id = Number(request.params.id);

  // Find the app in the book
  const service = services.find(s => s.id === id);

  if (!service) {
    return reply.status(404).send({ 
      error: 'No app with this ID! Are you registered?' 
    });
  }

  // Update: "I saw you just now!" 💓
  service.lastHeartbeat = new Date().toISOString();
  service.status = 'healthy';

  return {
    message: `💓 Got your heartbeat, ${service.name}! You're healthy.`
  };
});

// ============================================
// 4. LIST — see everyone in the book
// ============================================
fastify.get('/services', async (request, reply) => {
  return {
    count: services.length,
    services: services
  };
});

// ============================================
// 5. CHECK ONE APP — how is a specific app?  🆕 NEW!
// ============================================
fastify.get('/services/:id', async (request, reply) => {
  const id = Number(request.params.id);
  const service = services.find(s => s.id === id);

  if (!service) {
    return reply.status(404).send({ 
      error: 'No app with this ID!' 
    });
  }

  // 🆕 Check: how many seconds since last heartbeat?
  const secondsAgo = Math.floor(
    (new Date() - new Date(service.lastHeartbeat)) / 1000
  );

  return {
    service: service,
    secondsSinceHeartbeat: secondsAgo
  };
});

// Start the server
// ============================================
  // ============================================
// ROBOT HELPER 🤖 — checks the book every 10 seconds
// ============================================
setInterval(() => {
  const now = new Date();

  services.forEach(service => {
    const secondsAgo = (now - new Date(service.lastHeartbeat)) / 1000;

    if (secondsAgo > 60 && service.status !== 'down') {
      service.status = 'down';
      console.log(`🚨 ALERT: ${service.name} is DOWN! (silent for ${Math.floor(secondsAgo)}s)`);
    }
  });
}, 10000);  // every 10 seconds


// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('✅ Server is running! Open http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();