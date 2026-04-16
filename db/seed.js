const { Pool, Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'lostfound',
  password: 'Incorrect@47',
  port: 5432,
});

const SALT_ROUNDS = 10;

async function seed_db() {
  try {
    await client.connect();

    // Drop & Create Tables
    await client.query(`
    DROP TABLE IF EXISTS claims;
    DROP TABLE IF EXISTS items;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS tempuser;

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        mis VARCHAR(20) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        emailid VARCHAR(100) NOT NULL,
        role varchar(20) not null default 'user' check (role in ('user','admin')),
        acts_today INT DEFAULT 0 CHECK (acts_today >= 0),
        contact_info text,
        lastact TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    create table items(
        id serial primary key,
        name varchar(100) not null,
        description text,
        image_url text,
        finder_id int default null,
        owner_id int default null,
        location text,
        whenlost DATE,
        category varchar(20) check( category in ('electronics','idcards','books','keys','bags','wallet','documents','others')),
        type varchar(10) not null check (type in ('lost','found')),
        status varchar(10) not null default 'open' check (status in ('claimed','open','closed','matched')),
        reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        is_active boolean default true,
        contact_info text,
        foreign key(finder_id) references users(id) on delete set null,
        foreign key(owner_id) references users(id) on delete set null
    );

    CREATE INDEX idx_items_type ON items(type);
    CREATE INDEX idx_items_category ON items(category);
    CREATE INDEX idx_items_created ON items(reported_at DESC);

    create table tempuser(
        mis varchar(20),
        username varchar(30),
        emailid varchar (50),
        password text,
        otp int,
        primary key(username),
        createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE claims(
        id SERIAL PRIMARY KEY,
        user_id INT,
        item_id INT,
        status VARCHAR(10) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
    );
    `);

    // HASH PASSWORDS
    const users = [
      { mis: '123456', username: 'vedang', password: 'password', email: 'vedangs84@gmail.com', contact: '9322537659' },
      { mis: '123457', username: 'rahul', password: 'password', email: '112315171@iiitp.ac.in', contact: '9123456780' },
      { mis: '123458', username: 'priya', password: 'password', email: 'vedangs84@gmail.com', contact: '9988776655' },
      { mis: '123459', username: 'amit', password: 'password', email: 'vedangs84@gmail.com', contact: '9090909090' }
    ];

    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

      await client.query(
        `INSERT INTO users(mis, username, password, emailid, contact_info)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.mis, user.username, hashedPassword, user.email, user.contact]
      );
    }

    // Insert Items
    await client.query(`
    INSERT INTO items (name, description, finder_id, owner_id, location, category, type, contact_info, image_url)
    VALUES
    ('Black Wallet', 'Wallet with ID and cards', NULL, 1, 'Library', 'wallet', 'lost', '9876543210', 'https://picsum.photos/300?1'),
    ('HP Laptop', 'Laptop left in lab', NULL, 2, 'Computer Lab 2', 'electronics', 'lost', '9123456780', 'https://picsum.photos/300?2'),
    ('ID Card', 'Student ID card', NULL, 3, 'Canteen', 'idcards', 'lost', '9988776655', 'https://picsum.photos/300?3'),
    ('Math Book', 'Engineering maths book', NULL, 4, 'Classroom A-101', 'books', 'lost', '9090909090', 'https://picsum.photos/300?4'),

    ('Keys', 'Keys with red keychain', 2, NULL, 'Parking Area', 'keys', 'found', '9123456780', 'https://picsum.photos/300?5'),
    ('Backpack', 'Blue bag with books', 3, NULL, 'Library', 'bags', 'found', '9988776655', 'https://picsum.photos/300?6'),
    ('Phone', 'Samsung phone found', 4, NULL, 'Auditorium', 'electronics', 'found', '9090909090', 'https://picsum.photos/300?7'),
    ('Wallet', 'Brown wallet found', 1, NULL, 'Canteen', 'wallet', 'found', '9876543210', 'https://picsum.photos/300?8'),

    ('Notebook', 'Rough notebook', NULL, 1, 'Library', 'books', 'lost', '9876543210', 'https://picsum.photos/300?9'),
    ('Earphones', 'Wired earphones', 2, NULL, 'Campus Bus Stop', 'electronics', 'found', '9123456780', 'https://picsum.photos/300?10'),
    ('Documents', 'Important papers', NULL, 3, 'Admin Office', 'documents', 'lost', '9988776655', 'https://picsum.photos/300?11'),
    ('Bottle', 'Steel water bottle', 4, NULL, 'Gym Area', 'others', 'found', '9090909090', 'https://picsum.photos/300?12');
    `);

    console.log("✅ Seeding DB successful with hashed passwords!");
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
  } finally {
    await client.end();
  }
}

seed_db();