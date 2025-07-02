import Client from '../models/ClientModel.js';

// @desc    Create a new client
// @route   POST /api/v1/clients
// @access  Private (TODO: Add auth middleware)
export const createClient = async (req, res) => {
  try {
    const { name, phone, email, eventType, measurements } = req.body;

    // Basic validation
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const client = new Client({
      name,
      phone,
      email,
      eventType,
      measurements,
    });

    const createdClient = await client.save();
    res.status(201).json(createdClient);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error: Could not create client' });
  }
};

// @desc    Get all clients
// @route   GET /api/v1/clients
// @access  Private (TODO: Add auth middleware)
export const getClients = async (req, res) => {
  try {
    const { name, eventType } = req.query;
    const queryObject = {};

    if (name) {
      queryObject.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    if (eventType) {
      queryObject.eventType = { $regex: eventType, $options: 'i' };
    }

    const clients = await Client.find(queryObject).populate('styles');
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: Could not fetch clients' });
  }
};

// @desc    Get a single client by ID
// @route   GET /api/v1/clients/:id
// @access  Private (TODO: Add auth middleware)
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('styles');
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not fetch client' });
  }
};

// @desc    Update a client
// @route   PUT /api/v1/clients/:id
// @access  Private (TODO: Add auth middleware)
export const updateClient = async (req, res) => {
  try {
    const { name, phone, email, eventType, measurements } = req.body;
    const client = await Client.findById(req.params.id);

    if (client) {
      client.name = name || client.name;
      client.phone = phone || client.phone;
      client.email = email || client.email;
      client.eventType = eventType || client.eventType;
      client.measurements = measurements || client.measurements;

      const updatedClient = await client.save();
      res.json(updatedClient);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not update client' });
  }
};

// @desc    Delete a client
// @route   DELETE /api/v1/clients/:id
// @access  Private (TODO: Add auth middleware)
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (client) {
      await client.deleteOne(); // Correct method to remove the document
      res.json({ message: 'Client removed' });
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not delete client' });
  }
};

// @desc    Link a style to a client
// @route   POST /api/v1/clients/:clientId/styles
// @access  Private (TODO: Add auth middleware)
export const linkStyleToClient = async (req, res) => {
  try {
    const { styleId } = req.body;
    const client = await Client.findById(req.params.clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // TODO: Check if styleId is a valid ObjectId and if the style exists in Style collection

    if (client.styles.includes(styleId)) {
      return res.status(400).json({ message: 'Style already linked to this client' });
    }

    client.styles.push(styleId);
    await client.save();
    res.status(200).json(client);

  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Client or Style not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not link style to client' });
  }
};

// @desc    Get all styles for a specific client
// @route   GET /api/v1/clients/:clientId/styles
// @access  Private (TODO: Add auth middleware)
export const getClientStyles = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId).populate('styles');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client.styles);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not fetch client styles' });
  }
};
