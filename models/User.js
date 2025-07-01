import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  googleId: String,
  avatar: String,
});

export default model("User", userSchema);
