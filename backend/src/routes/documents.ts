import { Hono } from "hono";
import {
  uploadDocuments,
  getDocumentStatus,
  getUserDocuments,
} from "../controllers/documents";

const documents = new Hono();

documents.post("/", uploadDocuments);
documents.get("/", getUserDocuments);
documents.get("/:id/status", getDocumentStatus);

export default documents;
