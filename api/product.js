const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool } = require('./config/config');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

app.use(cors());

app.get('/getproductdetails', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM product_details');
        // console.log(data.rows);
        res.json(data.rows);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.post('/login', async (req, res) => {
    var { emailid, password } = req.body;
    console.log(req.body);
    try {
        var user = await pool.query("SELECT * FROM user_details WHERE email_id = $1", [emailid]);

        if (user.rows.length > 0) {
            var hashedPassword = user.rows[0].password;

            // Compare the provided password with the hashed password from the database
            var passwordMatch = bcrypt.compare(hashedPassword, password);
            if (passwordMatch) {
                ;
                await pool.query("UPDATE user_details SET logged_in = true WHERE email_id = $1", [emailid]);
                res.status(200).json({ emailid: user.rows[0].email_id, username: user.rows[0].username, success: true, message: 'Logged in successfully', cart_count: user.rows[0].cart_count });
            } else {
                res.status(200).json({ success: false, message: 'Invalid username or password' });
            }
        } else {
            res.status(200).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.post('/logout', async (req, res) => {
    const { emailid } = req.body;
    try {
        await pool.query("UPDATE user_details SET logged_in = false WHERE email_id = $1", [emailid]);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/check-login', async (req, res) => {
    const { emailid } = req.body;

    try {
        const user = await pool.query("SELECT * FROM user_details WHERE email_id = $1", [emailid]);
        console.log(user.rows, "check login");
        if (user.rows.length > 0 && user.rows[0].logged_in) {
            res.json({ loggedIn: true });
        } else {
            res.json({ loggedIn: false });
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/signup', async (req, res) => {
    try {

        const { emailid, password, username } = req.body; // Changed emailid to email for better readability
        console.log(req.body);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

        // Insert user details into the database
        await pool.query('INSERT INTO user_details(email_id, password, username) VALUES($1, $2, $3)', [emailid, hashedPassword, username]);

        console.log("Successfully Inserted");
        res.status(201).send({ success: true, message: "Account Created Successfully" });
    } catch (error) {
        console.error("Error during sign up:", error);
        res.status(500).send({ success: false, message: "Account creation failed. Please try again later" });
    }
});

app.post('/addtocart', async (req, res) => {
    try {
        const { emailid, product, username, cartCount } = req.body;
        let last_updated_dttm = new Date();
        console.log(req.body);
        await pool.query(
            "UPDATE user_details SET product_details = product_details || $1::jsonb[], cart_count = $2, last_updated_by = $3, last_updated_dttm = $4 WHERE email_id = $5",
            [[JSON.stringify(product)], cartCount, username, last_updated_dttm, emailid]
        );



        console.log("success");
        res.send({ "success": "Cart added Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});
app.post('/cart_details', async (req, res) => {
    console.log(req.body);
    const { emailid } = req.body
    let finaldata = []
    const data = await pool.query("Select product_details from user_details where email_id=$1", [emailid])

    const productDetails = data.rows[0].product_details;

    for (let i = 0; i < productDetails.length; i++) {
        const result = await pool.query("SELECT * FROM product_details WHERE product_id=$1", [productDetails[i].product_id]);
        finaldata = finaldata.concat(result.rows);
    }
    const productCountMap = new Map();

    // Filter out duplicates and count occurrences
    finaldata.forEach(product => {
        // Check if the product_id is already in the map
        if (productCountMap.has(product.product_id)) {
            // If yes, update the count
            const existingProduct = productCountMap.get(product.product_id);
            existingProduct.count += 1;
            productCountMap.set(product.product_id, existingProduct);
        } else {
            // If not, add it with count 1
            productCountMap.set(product.product_id, { ...product, count: 1 });
        }
    });

    // Convert the map values to an array since res.json() expects an array or object
    const uniqueProducts = Array.from(productCountMap.values());

    // Send the unique products with their counts
    res.json(uniqueProducts)
    // res.send(finaldata)
})




app.listen(4000, () => {
    console.log('App Running on port: 4000');
});
