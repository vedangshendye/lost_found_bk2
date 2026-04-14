const {Pool,Client}=require('pg')

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'lostfound',
  password: 'Incorrect@47',
  port: 5432,
});

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "lostfound",
  password: "Incorrect@47",
  port: 5432,
});

let SQL=`
drop table if exists items;
drop table if exists users;
drop table if exists tempuser;
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
insert into users(mis,username,password,emailid) values('123456','vedang','password','vedangs84@gmail.com');

CREATE TABLE claims(
    id SERIAL PRIMARY KEY,
    user_id INT,
    item_id INT,
    status VARCHAR(10) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);
`
async function seed_db() {
    try{
        await client.connect();
        await client.query(SQL);
        console.log("seeding db successful!")
    }
    catch(err){
        console.error(err);
        console.log("error in seeding database");
        console.log(err.message);
    }
    finally{
        await client.end();
    }
}
async function seed() {
  const client = await pool.connect();

  try {
    console.log("Seeding database...");

    await client.query("BEGIN");

    // 🔴 Drop tables (order matters because of FK)
    await client.query(`DROP TABLE IF EXISTS items CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS tempuser CASCADE;`);

    // 🟢 USERS TABLE
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        mis VARCHAR(50),
        username VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        emailid VARCHAR(255) UNIQUE NOT NULL,
        acts_today INTEGER DEFAULT 0,
        lastact TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🟢 TEMP USER TABLE
    await client.query(`
      CREATE TABLE tempuser (
        id SERIAL PRIMARY KEY,
        mis VARCHAR(50),
        username VARCHAR(100),
        password TEXT,
        emailid VARCHAR(255),
        otp INTEGER,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🟢 ITEMS TABLE
    await client.query(`
      CREATE TABLE items (
        id SERIAL PRIMARY KEY,
        name TEXT,
        description TEXT,
        image_url TEXT,
        finder_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        location TEXT,
        whenlost TIMESTAMP,
        category TEXT,
        type TEXT,
        status TEXT DEFAULT 'unmatched',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query("COMMIT");

    console.log("✅ Database seeded successfully (no dummy data)");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();