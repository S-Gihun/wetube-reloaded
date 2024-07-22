import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true},
    username: { type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    location: String,
})

userSchema.pre("save", async function(){ //this는 생성되는 User를 가르킨다.
    this.password = await bcrypt.hash(this.password, 5);
})

const User = mongoose.model("User", userSchema);
export default User;