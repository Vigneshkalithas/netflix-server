import { SignIn } from "../models/signin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Sessions } from "../models/session.model.js";

const Signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const ExistUser = await SignIn.findOne({ email: email });
    if (ExistUser) {
      res.status(400).send({ message: "user already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const userData = { email, password: hash, role };
      const user = new SignIn(userData);
      const token = jwt.sign(
        { _id: user._id + Date.now() },
        process.env.SECRET
      );
      const sessionData = new Sessions({ userId: user._id, token });
      await user.save();
      await sessionData.save();
      res
        .status(201)
        .send({ message: "sign up successfully", sessionData: sessionData });
    }
  } catch (error) {
    console.log(error);
  }
};

const GetUsers = async (req, res) => {
  const user = await SignIn.find();
  res.status(200).send(user);
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await SignIn.findOne({ email: email });

    if (!user) {
      return res.status(401).send({ message: "Invalid Credentials" });
    } else {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (!result) res.status(401).send({ message: "Invalid Credentials" });
        if (result) {
          const token = jwt.sign(
            { _id: user.id + Date.now() },
            process.env.SECRET
          );
          const sessionData = new Sessions({
            userId: user._id,
            token,
            role: user.role,
          });
          await user.save();
          await sessionData.save();
          res.status(200).json({
            message: "User logged in successfully",
            sessionData,
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const Logout = async (req, res) => {
  try {
    const { token } = req.body;
    const expireCheck = await Sessions.findOneAndUpdate(
      { token },
      { expired: true }
    );
    await expireCheck.save();
    res.status(200).send({ message: "logout succesfully" });
  } catch (error) {
    console.log(error);
  }
};

const Auth = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await SignIn.findById(userId);
    if (!user) {
      return res.status(403).send({ message: "Please Login" });
    } else {
      return res.send({ role: user.role });
    }
  } catch (error) {
    console.log(error);
  }
};

export { Signup, Login, Logout, GetUsers, Auth };
