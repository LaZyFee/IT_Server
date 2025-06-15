import express from 'express'
import {
    registerUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    makeAdmin,
    removeAdmin
} from '../controllers/UserController.js';

const userRoute = express.Router();

userRoute.get('/allusers', getAllUsers)
userRoute.get('/:id', getUser)
userRoute.post('/register', registerUser)
userRoute.put('/:id', updateUser)
userRoute.delete('/:id', deleteUser)
userRoute.put("/make-admin/:id", makeAdmin);
userRoute.put("/remove-admin/:id", removeAdmin);


export default userRoute