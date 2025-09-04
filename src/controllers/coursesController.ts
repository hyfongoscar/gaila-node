import { Request, Response } from "express";
import { fetchAllCourses } from "../models/courseModel";

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await fetchAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
