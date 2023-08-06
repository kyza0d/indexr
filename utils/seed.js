import { faker } from "@faker-js/faker";
import path from "path";
import * as fs from "node:fs";

const generateUsers = (count = 300) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: faker.string.uuid(),
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
    });
  }
  return users;
};

function saveToFile(filename, data) {
  // Ensure directory exists
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Convert data to string
  const dataString = JSON.stringify(data, null, 2); // The third argument helps format the JSON with 2 spaces indentation

  // Write to file
  fs.writeFileSync(filename, dataString);
}

const seedData = () => {
  const users = generateUsers();
  saveToFile("./public/usernames.json", users);
  // Repeat similar steps for other files: products, reviews, etc.
};

seedData();
