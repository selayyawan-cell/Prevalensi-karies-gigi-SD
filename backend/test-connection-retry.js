// test-connection-retry.js
const mysql = require('mysql2');

async function tryConnect(attempt = 1) {
    console.log(`🔄 Attempt #${attempt}...`);
    
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: '',
            database: 'db_karies_gigi',
            connectTimeout: 10000,
            charset: 'utf8mb4',
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });

        connection.connect((err) => {
            if (err) {
                connection.destroy();
                if (attempt < 3 && (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT')) {
                    console.log(`⏳ Waiting 2 seconds before retry...`);
                    setTimeout(() => tryConnect(attempt + 1).then(resolve).catch(reject), 2000);
                } else {
                    reject(err);
                }
            } else {
                console.log('✅ Connected!');
                connection.query('SELECT 1 + 1 as result', (err, results) => {
                    if (err) {
                        console.error('❌ Query error:', err.message);
                        connection.end();
                        reject(err);
                    } else {
                        console.log('✅ Query result:', results[0]);
                        connection.end();
                        resolve(results);
                    }
                });
            }
        });
    });
}

console.log('🧪 Starting connection test with retry...');
tryConnect()
    .then(() => {
        console.log('🎉 SUCCESS!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ All attempts failed:');
        console.error('   Code:', err.code);
        console.error('   Message:', err.message);
        process.exit(1);
    });