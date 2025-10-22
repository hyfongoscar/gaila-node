import { Response } from 'express';
import {
  fetchAssignmentById,
  fetchAssignmentsByStudentId,
  fetchAssignmentsByTeacherId,
  fetchAssignmentsCountByStudentId,
  fetchAssignmentsCountByTeacherId,
  saveNewAssignment,
} from 'models/assignmentModel';
import { fetchClassesByIds } from 'models/classModel';
import { fetchUsersByIds } from 'models/userModel';

import { AssignmentView } from 'types/assignment';
import { Class } from 'types/class';
import { AuthorizedRequest } from 'types/request';

const parseQueryNumber = (v: any): number | undefined => {
  if (typeof v === 'string') return parseInt(v, 10);
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string')
    return parseInt(v[0], 10);
  return undefined;
};

export const getUserAssignments = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  const parsedLimit = parseQueryNumber(req.query.limit);
  const parsedPage = parseQueryNumber(req.query.page);

  const limit = parsedLimit !== undefined ? parsedLimit : 10;
  const page = parsedPage !== undefined ? parsedPage : 1;

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return res.status(400).json({ message: 'Invalid pagination parameters' });
  }

  const resObj = { page, limit, value: [] as Class[] };

  if (req.user?.role === 'student') {
    resObj.value = await fetchAssignmentsByStudentId(req.user.id, limit, page);
  } else if (req.user?.role === 'teacher' || req.user?.role === 'admin') {
    resObj.value = await fetchAssignmentsByTeacherId(req.user.id, limit, page);
  } else {
    return res
      .status(403)
      .json({ message: 'Access forbidden: insufficient rights' });
  }
  if (parseQueryNumber(req.query.skipCount)) {
    return res.json(resObj);
  }

  let count = 0;
  if (req.user?.role === 'student') {
    count = await fetchAssignmentsCountByStudentId(req.user.id);
  } else if (req.user?.role === 'teacher' || req.user?.role === 'admin') {
    count = await fetchAssignmentsCountByTeacherId(req.user.id);
  }
  return res.json({ ...resObj, count });
};

export const getAssignmentDetails = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  const classId = Number(req.params.id);
  if (isNaN(classId)) {
    return res.status(400).json({ message: 'Invalid class ID' });
  }

  try {
    const classDetails = await fetchAssignmentById(classId);
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

export const createAssignment = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  if (!req.body.assignment) {
    return res.status(400).json({ message: 'Assignment details required' });
  }

  if (!req.user?.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const {
    title,
    description,
    type,
    instructions,
    minWordCount,
    maxWordCount,
    dueDate,
    rubrics,
    enrolledClassIds,
    enrolledStudentIds,
  } = req.body.assignment;

  if (
    !Array.isArray(enrolledClassIds) ||
    !enrolledClassIds.every(Number.isInteger) ||
    !Array.isArray(enrolledStudentIds) ||
    !enrolledStudentIds.every(Number.isInteger)
  ) {
    return res.status(400).json({ message: 'Invalid class or student IDs' });
  }

  if (
    !title ||
    !description ||
    !dueDate ||
    (!enrolledClassIds.length && !enrolledStudentIds.length)
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const classes = enrolledClassIds.length
    ? await fetchClassesByIds(enrolledClassIds)
    : [];
  if (classes.length !== enrolledClassIds.length) {
    return res.status(400).json({ message: 'Invalid class IDs' });
  }
  const students = enrolledStudentIds.length
    ? await fetchUsersByIds(enrolledStudentIds)
    : [];
  if (
    students.length !== enrolledStudentIds.length ||
    students.some(s => s.role !== 'student')
  ) {
    return res.status(400).json({ message: 'Invalid student IDs' });
  }

  const result = await saveNewAssignment(
    title,
    description,
    dueDate,
    type,
    instructions,
    minWordCount,
    maxWordCount,
    JSON.stringify(rubrics),
    req.user.id,
    enrolledClassIds,
    enrolledStudentIds,
  );

  if (!result) {
    return res.status(500).json({ message: 'Server error' });
  }

  const resObj: AssignmentView = {
    ...result,
    enrolledClasses: classes,
    enrolledStudents: students,
  };

  return res.status(201).json(resObj);
};
