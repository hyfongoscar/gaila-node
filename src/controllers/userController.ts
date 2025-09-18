import { Request, Response } from 'express';

import { fetchAllUsers } from '../models/userModel';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await fetchAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + JSON.stringify(err) });
  }
};
