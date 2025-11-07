import { ResultSetHeader } from 'mysql2';

import pool from 'config/db';
import { GptLog } from 'types/gpt';

export const fetchLatestGptLogByUserId = async (
  userId: number,
  limit?: number,
): Promise<GptLog[]> => {
  const [rows] = await pool.query(
    `SELECT * FROM gpt_logs WHERE user_id = ? ORDER BY id DESC LIMIT ?`,
    [userId, limit || 1],
  );
  return rows as GptLog[];
};

export const saveNewGptLog = async (
  user_id: number,
  assignment_tool_id: number,
  user_question: string,
  gpt_answer: string,
  whole_prompt: string,
  user_ask_time: number,
  gpt_response_time: number,
): Promise<GptLog> => {
  const [rows] = await pool.query(
    'INSERT INTO gpt_logs (user_id, assignment_tool_id, user_question, gpt_answer, whole_prompt, user_ask_time, gpt_response_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      user_id,
      assignment_tool_id,
      user_question,
      gpt_answer,
      whole_prompt,
      user_ask_time,
      gpt_response_time,
    ],
  );
  const insertResult = rows as ResultSetHeader;
  const gptLogId = insertResult.insertId;
  return {
    id: gptLogId,
    user_id,
    assignment_tool_id,
    user_question,
    gpt_answer,
    whole_prompt,
    user_ask_time,
    gpt_response_time,
  };
};
