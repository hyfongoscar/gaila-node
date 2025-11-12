import { Response } from 'express';
import { isNumber, isString } from 'lodash-es';
import {
  fetchLatestSubmissionsByAssignmentIdTeacherId,
  fetchLatestSubmissionsCountByAssignmentIdTeacherId,
  saveNewAssignmentSubmission,
} from 'models/assignmentSubmissionModel';
import { saveNewTraceData } from 'models/traceDataModel';

import { AssignmentSubmissionListingItemResponse } from 'types/assignment';
import { AuthorizedRequest } from 'types/request';
import parseQueryNumber from 'utils/parseQueryNumber';

export const submitAssignment = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  if (!req.user?.id) {
    return res
      .status(401)
      .json({ error_message: 'User not authenticated', error_code: 401 });
  }

  const { assignment_id, stage_id, content, is_final, is_manual } =
    req.body.submission;

  if (isNaN(assignment_id)) {
    return res
      .status(400)
      .json({ error_message: 'Missing assignment ID', error_code: 400 });
  }

  if (isNaN(stage_id)) {
    return res
      .status(400)
      .json({ error_message: 'Missing stage ID', error_code: 400 });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error_message: 'Missing content', error_code: 400 });
  }

  try {
    const submission = await saveNewAssignmentSubmission(
      assignment_id,
      stage_id,
      req.user.id,
      content,
      is_final || false,
    );

    saveNewTraceData(
      req.user.id,
      assignment_id,
      stage_id,
      is_manual ? 'SAVE' : 'AUTO_SAVE',
      content,
    );

    return res.status(200).json(submission);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res
        .status(400)
        .json({ error_message: e.message, error_code: 400 });
    }
    return res
      .status(500)
      .json({ error_message: 'Server error', error_code: 500 });
  }
};

export const getAssignmentSubmissionListing = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  if (!req.user?.id) {
    return res
      .status(401)
      .json({ error_message: 'User not authenticated', error_code: 401 });
  }

  const assignmentId = parseQueryNumber(req.query.assignment_id);
  if (!isNumber(assignmentId)) {
    return res
      .status(400)
      .json({ error_message: 'Missing assignment ID', error_code: 400 });
  }

  const parsedLimit = parseQueryNumber(req.query.limit);
  const parsedPage = parseQueryNumber(req.query.page);

  const limit = parsedLimit !== undefined ? parsedLimit : 10;
  const page = parsedPage !== undefined ? parsedPage : 1;

  const filter = (req.query.filter || '') as string;

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return res.status(400).json({
      error_message: 'Invalid pagination parameters',
      error_code: 400,
    });
  }

  if (!isString(filter)) {
    return res
      .status(400)
      .json({ error_message: 'Invalid filter', error_code: 400 });
  }

  const resObj = {
    page,
    limit,
    value: [] as AssignmentSubmissionListingItemResponse[],
  };

  const listingItems = await fetchLatestSubmissionsByAssignmentIdTeacherId(
    assignmentId,
    req.user.id,
    limit,
    page,
    filter,
  );
  resObj.value = listingItems.map(item => ({
    id: item.id,
    assignment_id: item.assignment_id,
    submitted_at: item.submitted_at,
    is_final: item.is_final,
    score: item.score,
    stage: {
      id: item.stage_id,
      stage_type: item.stage_type,
    },
    student: {
      id: item.student_id,
      username: item.username,
      first_name: item.first_name,
      last_name: item.last_name,
    },
  }));

  if (parseQueryNumber(req.query.skipCount)) {
    return res.json(resObj);
  }

  const count = await fetchLatestSubmissionsCountByAssignmentIdTeacherId(
    assignmentId,
    req.user.id,
    filter,
  );
  return res.json({ ...resObj, count });
};
