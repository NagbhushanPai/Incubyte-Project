import app, { prisma } from './app';

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
      await prisma.$connect();
      console.log('Connected to DB');
    } catch (err) {
      console.error('DB connection error', err);
    }
  });
}

export { prisma };
