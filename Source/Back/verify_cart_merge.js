require('dotenv').config();
const { dbConnection } = require('./database/config');
const { v4: uuidv4 } = require('uuid');

async function testCartMerge() {
    try {
        await dbConnection.authenticate();
        console.log('✅ Connected to DB');

        const [products] = await dbConnection.query('SELECT idProducto FROM productos LIMIT 1');
        const [users] = await dbConnection.query('SELECT idUser FROM users LIMIT 1');

        if (!products.length || !users.length) {
            console.error('❌ Need at least one product and one user in DB to test.');
            process.exit(1);
        }

        const idProducto = products[0].idProducto;
        const idUser = users[0].idUser;
        const guestId = `test-cart-guest-${Date.now()}`;
        const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

        console.log(`Testing with Product: ${idProducto}, User: ${idUser}, Guest: ${guestId}`);

        // 1. Add to Cart as GUEST
        console.log('👉 Adding to Cart as GUEST...');
        // CALL agregarAlCarrito(p_createDate, p_idProducto, p_cantidad, p_idUser, p_guest_id)
        // Using correct order from `cart_procedures.sql`
        await dbConnection.query('CALL agregarAlCarrito(?, ?, ?, ?, ?)', {
            replacements: [dateNow, idProducto, 2, null, guestId]
        });

        // 2. Verify Cart Exists for Guest
        console.log('👉 Verifying GUEST Cart...');
        const cartGuestRes = await dbConnection.query('SELECT * FROM carts WHERE guest_id = ?', {
            replacements: [guestId]
        });

        const cartGuest = cartGuestRes[0][0] || (Array.isArray(cartGuestRes[0]) ? cartGuestRes[0][0] : cartGuestRes[0]);

        if (cartGuest) {
            console.log('✅ Cart found for GUEST:', cartGuest);
        } else {
            console.error('❌ Cart NOT found for GUEST.');
            process.exit(1);
        }

        // Verify Items
        const [itemsGuest] = await dbConnection.query('SELECT * FROM cart_items WHERE idCart = ?', {
            replacements: [cartGuest.idCart]
        });
        if (itemsGuest.length > 0) {
            console.log(`✅ Guest has ${itemsGuest.length} items.`);
        } else {
            console.error('❌ Guest cart is empty.');
            process.exit(1);
        }

        // 3. Merge to User
        console.log(`👉 Merging Cart from Guest ${guestId} to User ${idUser}...`);
        await dbConnection.query('CALL fromGuestToUser(?, ?)', {
            replacements: [idUser, guestId]
        });

        // 4. Verify Guest Cart is GONE
        const [guestCartAfter] = await dbConnection.query('SELECT * FROM carts WHERE guest_id = ?', {
            replacements: [guestId]
        });
        if (guestCartAfter.length === 0) {
            console.log('✅ Guest cart removed after merge.');
        } else {
            console.error('❌ Guest cart STILL EXISTS after merge.');
        }

        // 5. Verify User Cart has Items
        console.log('👉 Verifying USER Cart...');
        const [finalUserCart] = await dbConnection.query('SELECT * FROM carts WHERE idUser = ?', {
            replacements: [idUser]
        });

        if (finalUserCart.length) {
            const userCartId = finalUserCart[0].idCart;
            const [finalItems] = await dbConnection.query('SELECT * FROM cart_items WHERE idCart = ?', {
                replacements: [userCartId]
            });

            // We expect items from guest (2) to be added. 
            // Note: User might have had items before.
            const found = finalItems.some(i => i.idProducto === idProducto);
            if (found) {
                console.log(`✅ Items successfully merged to User Cart ${userCartId}.`);
                console.log(finalItems);
            } else {
                console.error('❌ Merged items NOT found in User Cart.');
            }

        } else {
            console.error('❌ User cart NOT found.');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        process.exit(0);
    }
}

testCartMerge();
