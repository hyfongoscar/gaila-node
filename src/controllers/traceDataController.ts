import { Response } from 'express';
import { saveNewTraceData } from 'models/traceDataModel';

import { AuthorizedRequest } from 'types/request';

export const createTraceData = async (
  req: AuthorizedRequest,
  res: Response,
) => {
  if (!req.body.action) {
    return res
      .status(400)
      .json({ error_message: 'Assignment details required', error_code: 400 });
  }

  if (!req.user?.id) {
    return res
      .status(401)
      .json({ error_message: 'User not authenticated', error_code: 401 });
  }

  const newTraceData = saveNewTraceData(
    req.user.id,
    req.body.assignment_id || null,
    req.body.stage_id || null,
    req.body.action,
    req.body.content || null,
  );
  const [resObj, count] = await Promise.all([newTraceData, newTraceData]);

  return res.json({ ...resObj, count });
};
