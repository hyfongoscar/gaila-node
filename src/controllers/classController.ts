import { Response } from 'express';
import {
  fetchClassById,
  fetchClassesByStudentId,
  fetchClassesByTeacherId,
  fetchClassesCountByStudentId,
  fetchClassesCountByTeacherId,
} from 'models/classModel';

import { Class } from 'types/class';
import { AuthenticatedRequest } from 'types/request';

export const getUserClasses = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const limit = req.params.limit ? parseInt(req.params.limit, 10) : 10;
  const page = req.params.page ? parseInt(req.params.page, 10) : 1;

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return res.status(400).json({ message: 'Invalid pagination parameters' });
  }

  const resObj = { page, limit, data: [] as Class[] };

  if (req.user?.role === 'student') {
    resObj.data = await fetchClassesByStudentId(req.user.id, limit, page);
  } else if (req.user?.role === 'teacher' || req.user?.role === 'admin') {
    resObj.data = await fetchClassesByTeacherId(req.user.id, limit, page);
  } else {
    return res
      .status(403)
      .json({ message: 'Access forbidden: insufficient rights' });
  }
  if (req.params.skipCount) {
    return res.json(resObj);
  }

  let count = 0;
  if (req.user?.role === 'student') {
    count = await fetchClassesCountByStudentId(req.user.id);
  } else if (req.user?.role === 'teacher' || req.user?.role === 'admin') {
    count = await fetchClassesCountByTeacherId(req.user.id);
  }
  return res.json({ ...resObj, count });
};

export const getClassDetails = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const classId = Number(req.params.id);
  if (isNaN(classId)) {
    return res.status(400).json({ message: 'Invalid class ID' });
  }

  try {
    const classDetails = await fetchClassById(classId);
    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }
    return res.json(classDetails);
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Server error: ' + JSON.stringify(err) });
  }
};
