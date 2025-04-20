// Importar las dependencias necesarias
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const NUM_HOTELS = 100;

const generateHotels = () => {
  const hotels = [];
  for (let id = 0; id < NUM_HOTELS; id++) {
    // Generate a random ID for unsplash images (using their collection IDs)
    const randomId = Math.floor(Math.random() * 1000) + 1;
    hotels.push({
      id: faker.string.uuid(),
      name: `Hotel ${faker.word.words(2)}`,
      // Using unsplash source which doesn't rate limit and supports responsive images
      image: `https://picsum.photos/600/400?random=${id}`,
      address: faker.location.streetAddress(),
      stars: faker.number.int({ min: 1, max: 5 }),
      rate: parseFloat(faker.number.float({ min: 0, max: 5, fractionDigits: 1 })),
      price: faker.number.float({ min: 50, max: 1000, fractionDigits: 2 }),
      description: faker.lorem.paragraphs(4, '\n\n'), // Generate 2 paragraphs of text
    });
  }
  return hotels;
};

const generateDb = () => {
  const data = {
    hotels: generateHotels(),
  };

  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
};

generateDb();

// --- IMPORTANT ---
// After saving this file, you MUST run:
// npm run generate-db
// to update your db.json file with the new descriptions.
// --- IMPORTANT ---
