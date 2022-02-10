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
