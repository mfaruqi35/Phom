import ky from "ky";

const ragClient = ky.create({
  prefix: process.env.RAG_SERVICE_URL ?? "http://127.0.0.1:8000",
  timeout: 300000, // 5 minutes (300 seconds)
});

export const ragApi = {
  validate: (text: string) =>
    ragClient
      .post("validate", { json: { text } })
      .json<{ is_academic: boolean }>(),

  parseToc: (payload: { document_id: string; file_url: string }) =>
    ragClient.post("parse-toc", { json: payload }).json<{
      chapters: {
        label: string;
        title: string;
        page_start: number;
        page_end: number;
        order_index: number;
      }[];
    }>(),

  process: (payload: {
    document_id: string;
    file_url: string;
    chapters: { id: string; page_start: number; page_end: number }[];
  }) =>
    ragClient
      .post("process", { json: payload })
      .json<{ success: boolean; chunk_count: number }>(),

  generateQuestions: (payload: {
    session_id: string;
    document_id: string;
    chapter_ids: string[];
    mode: string;
  }) =>
    ragClient
      .post("generate-questions", { json: payload })
      .json<{ questions: string[] }>(),

  evaluate: (payload: {
    question: string;
    answer: string;
    document_id: string;
    chapter_ids: string[];
  }) =>
    ragClient.post("evaluate", { json: payload }).json<{
      is_satisfied: boolean;
      scores: {
        methodology: number;
        theory: number;
        argument_strength: number;
      };
      rebuttal: string | null;
      feedback: string | null;
    }>(),
};
