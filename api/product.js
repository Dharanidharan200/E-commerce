const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool } = require('./config/config');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/getproductdetails', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM product_details');
        console.log(data.rows);
        res.json(data.rows);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE emailid = $1", [username]);
        if (user.rows.length > 0 && user.rows[0].password === password) {
            await pool.query("UPDATE users SET logged_in = true WHERE emailid = $1", [username]);
            res.status(200).json({ success: true, message: 'Logged in successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/logout', async (req, res) => {
    const { username } = req.body;
    try {
        await pool.query("UPDATE users SET logged_in = false WHERE emailid = $1", [username]);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/check-login', async (req, res) => {
    const { username } = req.query;
    try {
        const user = await pool.query("SELECT * FROM users WHERE emailid = $1", [username]);
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

app.post('/addtocart', async(req,res)=>{
    try {
        console.log(req.body);
    } catch (error) {
        
    }
})
app.listen(4000, () => {
    console.log('App Running on port: 4000');
});
