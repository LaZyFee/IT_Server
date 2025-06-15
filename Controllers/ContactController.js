import ContactMessage from '../Models/ContactMessage.js';

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const newMessage = new ContactMessage({
            name,
            email,
            subject,
            message
        });

        await newMessage.save();

        res.status(201).json({ message: 'Contact message submitted successfully.' });
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
export const markAsResponded = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await ContactMessage.findByIdAndUpdate(
            id,
            { responded: true },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (error) {
        console.error("Error marking responded:", error);
        res.status(500).json({ error: "Could not update message status." });
    }
};

// Get all messages
export const getAllMessages = async (req, res) => {
    try {
        const sort = req.query.sort === "asc" ? 1 : -1;
        const messages = await ContactMessage.find().sort({ createdAt: sort });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};