const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true
    },

    password: {
      type: String,
      required: [true, "Password is required"]
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      lowercase: true,
      default: "user"
    }
  },
  { timestamps: true }
);

/* Hash Password Before Saving */
userSchema.pre("save", async function () {

  try {
  if (this.isModified("password")) {

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
  }

  } catch (error) {
    console.error("Error hashing password:", error);
  }

});

/* Compare Password */
userSchema.methods.comparePassword = async function (password) {

  return await bcrypt.compare(password, this.password);

};

module.exports = mongoose.model("User", userSchema);