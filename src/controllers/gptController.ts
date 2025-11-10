import { Response } from 'express';
import { isNil } from 'lodash-es';
import { fetchLatestSubmissionByStageIdStudentId } from 'models/assignmentSubmissionModel';
import {
  fetchAssignmentToolByAssignmentToolId,
  fetchRolePromptByAssignmentToolId,
} from 'models/assignmentToolModel';
import {
  fetchGptLogsByUserIdToolId,
  fetchLatestGptLogByUserId,
  saveNewGptLog,
} from 'models/gptLogModel';
import { saveNewTraceData } from 'models/traceDataModel';

import { GptLog, GptResponse } from 'types/gpt';
import { AuthorizedRequest } from 'types/request';
import parseQueryNumber from 'utils/parseQueryNumber';

const fetchChatReponse = async (
  question: string,
  rolePrompt: string,
  essay: string,
  pastMessages: GptLog[],
): Promise<GptResponse> => {
  const chatServiceUrl =
    process.env.CHAT_SERVICE_URL || 'http://localhost:5000';

  const data = new URLSearchParams({
    myusername: process.env.CHAT_SERVICE_USERNAME || '',
    mypassword: process.env.CHAT_SERVICE_PASSWORD || '',
    userQuestions: question,
    chatgptRoleDescription: rolePrompt,
    essay,
    past_messages: JSON.stringify(pastMessages),
    chatgptParameters: '1000;;;1;;;2',
  });

  const res = await fetch(chatServiceUrl + '/chatgpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  });

  return res.json();
};

export const askGptModel = async (req: AuthorizedRequest, res: Response) => {
  if (!req.body.assignment_tool_id) {
    return res
      .status(400)
      .json({ error_message: 'Chat type required', error_code: 400 });
  }

  if (!req.body.question) {
    return res
      .status(400)
      .json({ error_message: 'No question given', error_code: 400 });
  }

  if (!req.user?.id) {
    return res
      .status(401)
      .json({ error_message: 'User not authenticated', error_code: 401 });
  }

  const { question, assignment_tool_id } = req.body;
  const rolePrompt =
    await fetchRolePromptByAssignmentToolId(assignment_tool_id);

  if (!rolePrompt) {
    return res
      .status(500)
      .json({ error_message: 'Role prompt not found', error_code: 500 });
  }

  const assignmentTool =
    await fetchAssignmentToolByAssignmentToolId(assignment_tool_id);
  if (!assignmentTool) {
    return res.status(400).json({
      error_message: 'Essay not given and assignment not found',
      error_code: 400,
    });
  }

  const { assignment_id: assignmentId, assignment_stage_id: stageId } =
    assignmentTool;

  let essay = req.body.essay || '';
  if (!essay && req.user?.role === 'student') {
    const latestEssaySubmission = await fetchLatestSubmissionByStageIdStudentId(
      assignmentId,
      req.user.id,
    );
    if (!latestEssaySubmission) {
      return res.status(400).json({
        error_message: 'Essay not given and assignment submission not found',
        error_code: 400,
      });
    }
    essay = JSON.stringify(latestEssaySubmission.content);
  }

  const pastMessages = await fetchLatestGptLogByUserId(req.user.id, 5);

  try {
    const userAskTime = Date.now();
    const chatRes = await fetchChatReponse(
      question,
      rolePrompt,
      essay || '',
      pastMessages,
    );

    if (!chatRes.response.choices[0]) {
      throw new Error('Invalid response from ChatGPT');
    }
    const gptAnswer = chatRes.response.choices[0].message.content;
    if (!gptAnswer) {
      throw new Error('No response content from ChatGPT');
    }

    const gptLog = await saveNewGptLog(
      req.user.id,
      assignment_tool_id,
      question,
      gptAnswer,
      JSON.stringify(chatRes.wholeprompt),
      userAskTime,
      Date.now(),
    );

    await saveNewTraceData(
      req.user.id,
      assignmentId,
      stageId,
      'ASK_GPT',
      JSON.stringify({
        question,
        answer: gptAnswer,
      }),
    );

    return res.json(gptLog);
  } catch (e) {
    return res.status(500).json({
      error_message: 'ChatGPT error: ' + JSON.stringify(e),
      error_code: 500,
    });
  }
};

export const getGptHistory = async (req: AuthorizedRequest, res: Response) => {
  if (!req.user?.id) {
    return res
      .status(401)
      .json({ error_message: 'User not authenticated', error_code: 401 });
  }

  const parsedToolId = parseQueryNumber(req.query.assignment_tool_id);
  const parsedLimit = parseQueryNumber(req.query.limit);
  const parsedPage = parseQueryNumber(req.query.page);

  const limit = parsedLimit !== undefined ? parsedLimit : 10;
  const page = parsedPage !== undefined ? parsedPage : 1;

  if (
    isNil(parsedToolId) ||
    (isNaN(parsedToolId) && !req.query.assignment_tool_key)
  ) {
    return res
      .status(400)
      .json({ error_message: 'Invalid assignment tool id', error_code: 400 });
  }

  if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
    return res.status(400).json({
      error_message: 'Invalid pagination parameters',
      error_code: 400,
    });
  }

  const gptLogs = await fetchGptLogsByUserIdToolId(
    req.user.id,
    parsedToolId,
    limit,
    page,
  );

  return res.json({ page, limit, value: gptLogs });
};
