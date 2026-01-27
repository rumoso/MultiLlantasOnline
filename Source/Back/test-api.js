const http = require('http');

const postRequest = (path, body, headers = {}) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: '127.0.0.1', // Assuming local backend
            port: 8080, // Checked .env, says PORT=8080
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: responseBody
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

(async () => {
    try {
        console.log('Testing /api/favorites/get (Guest)...');
        const favRes = await postRequest('/api/favorites/get', { idUser: 0 }, { 'x-guest-id': 'test-http-guest' });
        console.log('Favorites Response:', favRes.statusCode, favRes.body.substring(0, 100));

        console.log('\nTesting /api/products/getProductsPag...');
        const prodRes = await postRequest('/api/productos/getProductsPag', { pageIndex: 0, pageSize: 12 });
        console.log('Products Response:', prodRes.statusCode, prodRes.body.substring(0, 100));

    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
})();
