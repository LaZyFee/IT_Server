import { User } from "../Models/UserModel.js";

const registerUser = async (req, res) => {
    try {
        const { name, email, provider, uid, role } = req.body;

        if (!name || !email || !provider || !uid) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });

        if (provider === "google.com") {
            if (existingUser) {
                return res.status(200).json(existingUser);
            }
        }

        // Email/Password: If user exists, return error
        if (provider === "password" && existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Save new user
        const newUser = new User({
            name,
            email,
            provider,
            uid,
            role
        });

        const savedUser = await newUser.save();

        return res.status(201).json(savedUser);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const getUser = async (req, res) => {
    try {
        const uid = req.params.id;
        console.log(uid)
        if (!uid) {
            return res.status(400).json({ message: "UID is required" });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        let { name, email } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const updateData = { name, email };

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const { password: _, ...userWithoutPassword } = updatedUser._doc;
        return res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
const makeAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: "admin" },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User promoted to admin successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error promoting user to admin:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
const removeAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: "user" }, // Set back to regular user
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Admin role removed successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error removing admin role:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};



export {
    registerUser,
    getUser,
    updateUser,
    deleteUser,
    getAllUsers,
    makeAdmin,
    removeAdmin
};