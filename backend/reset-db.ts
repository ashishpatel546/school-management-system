import { Client } from 'pg';

async function resetDb() {
    const client = new Client({
        connectionString: 'postgresql://postgres:root@123@localhost:5432/school_management',
    });

    try {
        await client.connect();
        console.log('Connected to database.');
        await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('Database schema reset successfully.');
    } catch (err) {
        console.error('Error resetting database:', err);
    } finally {
        await client.end();
    }
}

resetDb();
