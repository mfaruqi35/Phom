import { Hono } from "hono";
import {
  getChaptersByDocument,
  createChapters,
  updateChapter,
  deleteChapter,
} from "../controllers/chapters";

const chapters = new Hono();

chapters.get("/:documentId", getChaptersByDocument);
chapters.post("/:documentId", createChapters);
chapters.put("/:id", updateChapter);
chapters.delete("/:id", deleteChapter);

export default chapters;
