import { Response } from 'express';
import { fetchClassOptionsByTeacherId } from 'models/classModel';
import { fetchStudentOptionsInClass } from 'models/userModel';

import { AuthorizedRequest } from 'types/request';
import parseQueryNumber from 'utils/parseQueryNumber';

export const getClassOptions = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  return res.json(await fetchClassOptionsByTeacherId(req.user.id));
};

export const getStudentOptions = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  if (!req.query.classId) {
    return res.status(400).json({ message: 'Class ID is required' });
  }

  const classId = parseQueryNumber(req.query.classId);
  if (!classId || isNaN(classId)) {
    return res.status(400).json({ message: 'Invalid class ID' });
  }

  return res.json(await fetchStudentOptionsInClass(classId));
};
