import pool from "../config/db";
import { Course } from "../types/course";

export const fetchAllCourses = async (): Promise<Course[]> => {
  const [rows] = await pool.query("SELECT * FROM courses");
  return rows as Course[];
};
