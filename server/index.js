
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const crypto = require('crypto');
const session = require('express-session');


const merchentform = require('./models/MerchentSignUp.model');
const form = require('./models/UserSignUp.model');
const AddCoupon = require('./models/AddCoupon.model');
const Wishlist = require('./models/Wishlist.model');
const Profile=require('./models/Profile.model')
const app = express();
app.use(bodyParser.json());

const url = process.env.ATLAS_URL;
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected Successfully"))
    .catch((err) => { console.log(err); });


const connection = mongoose.connection;
connection.setMaxListeners(15); 
connection.once('open', () => {
    console.log("Mongoose database connected successfully");
});



app.post('/login', (req, res) => {
    const { email, password } = req.body;
    form.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("Success");
                } else {
                    res.json("Incorrect Password");
                }
            } else {
                res.json("No record exists. Incorrect email");
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});


const secureKey = crypto.randomBytes(32).toString('hex');

app.use(session({
    secret: secureKey,
    resave: false,
    saveUninitialized: true,
}));

app.post('/merchentlogin', (req, res) => {
    const { email, password } = req.body;
    merchentform.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    
                    req.session.email = email;
                    console.log(req.session.email);
                    res.json("Success");
                } else {
                    res.json("Incorrect Password");
                }
            } else {
                res.json("No record exists. Incorrect email");
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});


app.post('/form', async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const existingUser = await form.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "Merchant with this email already exists" });
        }

        const formData = new form({ fullname, email, password });
        await formData.save();

        res.status(200).json({ message: 'Merchant registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/merchentform', async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const existingUser = await merchentform.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "Merchant with this email already exists" });
        }

        const formData = new merchentform({ fullname, email, password });
        await formData.save();

        res.status(200).json({ message: 'Merchant registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });



app.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        res.json({ imageUrl: `http://localhost:8001/uploads/${req.file.originalname}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});




app.post('/AddCoupon', async (req, res) => {
    try {
      console.log('Request Body:', req.body); 
  
      const {
        merchantEmail,
        title,
        description,
        coupon,
        image,
        discountType,
        percentage,
        fixedAmount,
        buyOneGet,
        buyOneGetQuantity,
        startDate,
        usageLimits,
        expirationDate,
        latitude, // Include latitude and longitude
      longitude,

      } = req.body;

   // Fetch merchant's location based on email
   const profile = await Profile.findOne({ email: merchantEmail });
   if (!profile) {
     return res.status(404).json({ message: 'Merchant profile not found' });
   }
  
      const newCoupon = new AddCoupon({
        merchantEmail,
        title,
        description,
        coupon,
        image,
        discountType,
        percentage,
        fixedAmount,
        buyOneGet,
        buyOneGetQuantity,
        startDate,
        usageLimits,
        expirationDate,
        latitude: profile.latitude,
        longitude: profile.longitude,
        address:profile.address,
      });
  
      await newCoupon.save();
      res.status(200).json({ message: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  //-----------------------------------------

// Backend API - Update getCoupons endpoint

app.get('/getCoupons', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; // Extract page size from query parameter

    const coupons = await AddCoupon.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


  app.post('/addToWishlist', async (req, res) => {
    try {
      const { userEmail, couponId } = req.body;
  
   
      const newWishlistItem = new Wishlist({
        userEmail,
        couponId,
      });
  
      await newWishlistItem.save();
  
      res.status(200).json({ message: 'Coupon added to wishlist successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  


app.get('/getWishlist/:userEmail', async (req, res) => {
    try {
        const userEmail = req.params.userEmail;
        console.log(userEmail);

        const wishlist = await Wishlist.find({ userEmail });

        res.status(200).json(wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/getCouponDetails/:couponId', async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const couponDetails = await AddCoupon.findById(couponId);
        res.status(200).json(couponDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/saveProfile', async (req, res) => {
    try {
        const { email, address, latitude, longitude } = req.body;

        if (!email || !address || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingProfile = await Profile.findOne({ email });

        if (existingProfile) {
            // Update existing profile
            existingProfile.address = address;
            existingProfile.latitude = latitude;
            existingProfile.longitude = longitude;
            await existingProfile.save();

            console.log('Profile updated successfully:', existingProfile);
            return res.json({ message: 'Profile updated successfully' });
        }

        // Create a new profile if it doesn't exist
        const profile = new Profile({ email, address, latitude, longitude });
        const savedProfile = await profile.save();

        console.log('Profile saved successfully:', savedProfile);
        res.json({ message: 'Profile saved successfully' });
    } catch (error) {
        console.error('Error saving/updating profile:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

app.post('/getNearbyCoupons', async (req, res) => {
    try {
      const { userLatitude, userLongitude } = req.body;
  
      const coupons = await AddCoupon.find();
  
      // Filter coupons based on distance (e.g., within 1 km)
      const nearbyCoupons = coupons.filter((coupon) => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          coupon.latitude,
          coupon.longitude
        );
        return distance <= 1; // Adjust the distance threshold as needed
      });
  
      res.status(200).json(nearbyCoupons);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.get('/getMerchantLocation/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const profile = await Profile.findOne({ email });
  
      if (profile) {
        const { latitude, longitude } = profile;
        res.status(200).json({ latitude, longitude });
      } else {
        res.status(404).json({ message: 'Merchant profile not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  
  app.get('/getMerchantAddress/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const profile = await Profile.findOne({ email });
  
      if (profile) {
        const { address } = profile;
        res.status(200).json({ address });
      } else {
        res.status(404).json({ message: 'Merchant profile not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  app.post('/removeFromWishlist', async (req, res) => {
    try {
      const { userEmail, couponId } = req.body;
      await Wishlist.deleteOne({ userEmail, couponId });
      res.status(200).json({ message: 'Item removed from wishlist successfully' });
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.get('/getMerchantCoupons/:merchantEmail', async (req, res) => {
    try {
      const { merchantEmail } = req.params;
      const merchantCoupons = await AddCoupon.find({ merchantEmail });
      res.json(merchantCoupons);
    } catch (error) {
      console.error('Error fetching merchant coupons:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  

app.listen('8001', () => {
    console.log("App running on port 8001");
});

