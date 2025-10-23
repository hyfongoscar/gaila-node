import { Response } from 'express';
import {
  fetchClassById,
  fetchClassesCountByStudentId,
  fetchClassesCountByTeacherId,
  fetchClassListingByStudentId,
  fetchClassListingByTeacherId,
} from 'models/classModel';

import { Class } from 'types/class';
import { AuthenticatedRequest } from 'types/request';
import parseQueryNumber from 'utils/parseQueryNumber';

export const getUserClasses = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const parsedLimit = parseQueryNumber(req.query.limit);
  const parsedPage = parseQueryNumber(req.query.page);

  const limit = parsedLimit !== undefined ? parsedLimit : 10;
  const page = parsedPage !== undefined ? parsedPage : 1;

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return res
      .status(400)
      .json({ message: 'Invalid pagination parameters', error_code: 400 });
  }

  const resObj = { page, limit, value: [] as Class[] };

  if (req.user?.role === 'student') {
    resObj.value = await fetchClassListingByStudentId(req.user.id, limit, page);
  } else if (req.user?.role === 'teacher' || req.user?.role === 'admin') {
    resObj.value = await fetchClassListingByTeacherId(req.user.id, limit, page);
  } else {
    return res.status(403).json({
      message: 'Access forbidden: insufficient rights',
      error_code: 403,
    });
  }
  if (parseQueryNumber(req.query.skipCount)) {
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
    return res
      .status(400)
      .json({ message: 'Invalid class ID', error_code: 400 });
  }

  try {
    const classDetails = await fetchClassById(classId);
    if (!classDetails) {
      return res
        .status(404)
        .json({ message: 'Class not found', error_code: 404 });
    }
    return res.json(classDetails);
  } catch (err) {
    return res.status(500).json({
      message: 'Server error: ' + JSON.stringify(err),
      error_code: 500,
    });
  }
};
