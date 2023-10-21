require('dotenv').config()
const Stripe = require("stripe")
const stripe = Stripe(process.env.STRIPE_SECRET)
const bcrypt = require('bcrypt')
const User = require("../models/userSchema");
const jwt = require('jsonwebtoken');
const Cart = require('../models/cartSchema');
const { Payment } = require('../models/paymentSchema');
const { Subscription } = require('../models/subscriptionSchema');


module.exports = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already registered' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ name, email, password: hashedPassword });
            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Unable to register user' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });

            res.status(200).json({ message: 'User logged in successfully', token, user });

        } catch (error) {
            res.status(500).json({ error: 'Unable to log in' });
        }
    },

    add_to_cart: async (req, res) => {
        try {
            const { product, price } = req.body.item;
            const isExisting = await Cart.findOne({ "product": product });

            if (!isExisting) {
                const cartItem = new Cart({
                    product: product,
                    price: price,
                    count: 1,
                    user: req?.body?.userId
                });
                await cartItem.save();
                res.status(201).json({ message: 'Product added to cart' });
            } else {
                res.status(200).json({ message: 'Product is already in the cart' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Unable to add to cart' });
        }
    },

    cart_items: async (req, res) => {
        try {
            const userId = req.query.userId
            const products = await Cart.find({ user: userId })
            res.status(200).json({ products })
        } catch (error) {
            res.status(500).json({ error: 'Unable to fetch products' });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const itemId = req.query.itemId;
            const response = await Cart.deleteOne({ _id: itemId });

            if (response.deletedCount === 1) {
                res.status(200).json({ message: "Successfully deleted" });
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Unable to fetch products' });
        }
    },

    checkout: async (req, res) => {
        try {
            const amount = Number(req.body.amount);
            const userId = req.body.userId;
            const userName = req.body.userName;
            const createdAt = req.body.createdAt;

            const payment = new Payment({
                amount: amount,
                userId: userId,
                userName: userName,
                createdAt: createdAt
            });

            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: req.body.userName,
                                description: 'Pay for your product',
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1
                    },
                ],
                mode: 'payment',
                success_url: 'http://127.0.0.1:5173/cart',
                cancel_url: 'http://127.0.0.1:5173/cart',
            });
            try {
                await payment.save();
                await Cart.deleteMany({ user: userId });
                res.send({ url: session.url });
            } catch (error) {
                res.status(500).send({ message: "Not saved in the database" });
            }
        } catch (error) {
            res.status(500).send({ message: "Error in Stripe" });
        }
    },

    purchase_status: async (req, res) => {
        try {
            const userId = req.query.userId
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ hasPurchased: user.hasPurchasedPack });
        } catch (error) {
            res.status(500).send({ message: "Subscribe for more videos..!" })
        }
    },

    subscription: async (req, res) => {
        try {
            const amount = Number(req.body.amount);
            const userId = req.body.userId;
            const userName = req.body.userName;
            const createdAt = req.body.createdAt;

            const subscription = new Subscription({
                amount: amount,
                userId: userId,
                userName: userName,
                createdAt: createdAt
            });

            try {
                await subscription.save()
            } catch (error) {
                res.status(500).send({ message: "Not saved in database" })
            }
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: req.body.userName,
                                description: 'Subscribe for More videos',
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1
                    },
                ],
                mode: 'payment',
                success_url: 'http://127.0.0.1:5173/podcast',
                cancel_url: 'http://127.0.0.1:5173/podcast',
            });
            await User.updateOne({ _id: userId }, { $set: { hasPurchasedPack: true } });
            res.send({ url: session.url });
        } catch (error) {
            res.status(500).send({ message: "Subscribe for more videos..!" })
        }
    }
}