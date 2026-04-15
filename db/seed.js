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
INSERT INTO users(mis, username, password, emailid, contact_info) VALUES
('123456','vedang','password','vedangs84@gmail.com','9322537659'),
('123457','rahul','password','112315171@iiitp.ac.in','9123456780'),
('123458','priya','password','priya@gmail.com','9988776655'),
('123459','amit','password','amit@gmail.com','9090909090');

CREATE TABLE claims(
    id SERIAL PRIMARY KEY,
    user_id INT,
    item_id INT,
    status VARCHAR(10) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
);

INSERT INTO items (name, description, finder_id, owner_id, location, category, type, contact_info, image_url)
VALUES

-- LOST ITEMS
('Black Wallet', 'Wallet with ID and cards', NULL, 1, 'Library', 'wallet', 'lost', '9876543210', 'https://picsum.photos/300?1'),
('HP Laptop', 'Laptop left in lab', NULL, 2, 'Computer Lab 2', 'electronics', 'lost', '9123456780', 'https://picsum.photos/300?2'),
('ID Card', 'Student ID card', NULL, 3, 'Canteen', 'idcards', 'lost', '9988776655', 'https://picsum.photos/300?3'),
('Math Book', 'Engineering maths book', NULL, 4, 'Classroom A-101', 'books', 'lost', '9090909090', 'https://picsum.photos/300?4'),

-- FOUND ITEMS
('Keys', 'Keys with red keychain', 2, NULL, 'Parking Area', 'keys', 'found', '9123456780', 'https://picsum.photos/300?5'),
('Backpack', 'Blue bag with books', 3, NULL, 'Library', 'bags', 'found', '9988776655', 'https://picsum.photos/300?6'),
('Phone', 'Samsung phone found', 4, NULL, 'Auditorium', 'electronics', 'found', '9090909090', 'https://picsum.photos/300?7'),
('Wallet', 'Brown wallet found', 1, NULL, 'Canteen', 'wallet', 'found', '9876543210', 'https://picsum.photos/300?8'),

-- EXTRA FOR PAGINATION
('Notebook', 'Rough notebook', NULL, 1, 'Library', 'books', 'lost', '9876543210', 'https://picsum.photos/300?9'),
('Earphones', 'Wired earphones', 2, NULL, 'Campus Bus Stop', 'electronics', 'found', '9123456780', 'https://picsum.photos/300?10'),
('Documents', 'Important papers', NULL, 3, 'Admin Office', 'documents', 'lost', '9988776655', 'https://picsum.photos/300?11'),
('Bottle', 'Steel water bottle', 4, NULL, 'Gym Area', 'others', 'found', '9090909090', 'https://picsum.photos/300?12');
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
seed_db();