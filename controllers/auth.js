import jwt from 'jsonwebtoken';

// Impport User model
import User from '../models/user';

// Import passowrd hashing utilities
import { hashPassword, comparePassword } from '../utils/auth';

export const register = async (req, res) => {
  try {
    // Destructure the request body from frontend
    const { name, email, password } = req.body;
    // Validate the user name and password
    if (!name) return res.status(400).send('Name is required');
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send('Password is required and should be min 6 characters long');
    }

    // Check if user exists
    let userExist = await User.findOne({ email }).exec();

    // Check if email is already in use
    if (userExist) return res.status(400).send('Credentials already taken!');

    // Hash the password and save it in a variable
    const hashedPassword = await hashPassword(password);

    // Register the user with proper hashed password
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user in the database
    await user.save();

    // Return a ok response
    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send('Error with registration');
  }
};

export const login = async (req, res) => {
  try {
    // Destructure
    const { email, password } = req.body;

    // Find user by searching against db
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send('Credentials Not Found');

    // Check password
    const match = await comparePassword(password, user.password);

    // Create signed JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Return user and token to client, exclude hashed password
    user.password = undefined;

    // Send token in cookie with httponly flag so its not accesible with JS
    res.cookie('token', token, {
      httpOnly: true,
      // secure: true, // only works on https
    });

    // Send user as json response
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send('There was an Error Logging In, Try Again!');
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.json({ message: 'Logout Succesful!' });
  } catch (err) {
    console.log(err);
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').exec();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
