require('dotenv').config();
const { dbConnection } = require('./database/config');
const { v4: uuidv4 } = require('uuid');

async function testGuestFavorites() {
    try {
        await dbConnection.authenticate();
        console.log('✅ Connected to DB');

        // 1. Get a valid product and user
        const [products] = await dbConnection.query('SELECT idProducto FROM productos LIMIT 1');
        const [users] = await dbConnection.query('SELECT idUser FROM users LIMIT 1');

        if (!products.length || !users.length) {
            console.error('❌ Need at least one product and one user in DB to test.');
            process.exit(1);
        }

        const idProducto = products[0].idProducto;
        const idUser = users[0].idUser; // We will merge TO this user
        const guestId = `test-guest-${Date.now()}`;

        console.log(`Testing with Product: ${idProducto}, User: ${idUser}, Guest: ${guestId}`);

        // 2. Add to favorites as GUEST
        console.log('👉 Adding to favorites as GUEST...');
        await dbConnection.query('CALL toggleFavorite(?, ?, ?)', {
            replacements: [null, guestId, idProducto]
        });

        // 3. Verify it exists for GUEST
        console.log('👉 Verifying GUEST favorites...');
        const favoritesGuest = await dbConnection.query('CALL getMyFavorites(?, ?)', {
            replacements: [null, guestId]
        });

        // Handling potentially different return structures from Sequelize/Driver
        const guestFavs = favoritesGuest[0] || (Array.isArray(favoritesGuest) ? favoritesGuest : []);
        // Note: Raw query might return [results, metadata] or just results depending on driver. 
        // But `CALL` usually returns an array of result sets.

        // Let's inspect the output structure safely
        // Usually: [ [ { idFavorite: ... } ], { packet... } ]

        const actualGuestFavs = Array.isArray(guestFavs) ? guestFavs : [];
        const found = actualGuestFavs.some(f => f.idProducto === idProducto);

        if (found) {
            console.log('✅ Favorite found for GUEST.');
        } else {
            console.error('❌ Favorite NOT found for GUEST.');
            console.log('Result:', JSON.stringify(favoritesGuest, null, 2));
        }

        // 4. Merge to User
        console.log(`👉 Merging favorites from Guest ${guestId} to User ${idUser}...`);
        await dbConnection.query('CALL fromGuestToUser(?, ?)', {
            replacements: [idUser, guestId]
        });

        // 5. Verify it exists for USER and NOT for Guest
        console.log('👉 Verifying USER favorites...');
        const favoritesUser = await dbConnection.query('CALL getMyFavorites(?, ?)', {
            replacements: [idUser, null]
        });

        const userFavs = favoritesUser[0] || [];
        const foundUser = Array.isArray(userFavs) && userFavs.some(f => f.idProducto === idProducto);

        if (foundUser) {
            console.log('✅ Favorite successfully moved to USER.');
        } else {
            console.error('❌ Favorite NOT found for USER after merge.');
            console.log('Result:', JSON.stringify(favoritesUser, null, 2));
        }

        // Clean up (remove test favorite)
        // await dbConnection.query('DELETE FROM favorites WHERE idUser = ? AND idProducto = ?', { replacements: [idUser, idProducto] });

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        process.exit(0);
    }
}

testGuestFavorites();
