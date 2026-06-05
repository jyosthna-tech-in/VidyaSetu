import { AdminRepository } from "./admin.repository";
import { AdminApiError } from "./admin.types";
import type { SeedNcertInput, AddQuestionInput } from "./admin.types";

export class AdminServices {
  static async seedNcert(input: SeedNcertInput) {
    const result = await AdminRepository.seedNcertData(input);
    return result;
  }

  static async addQuestion(input: AddQuestionInput) {
    if (input.topicId) {
      const topic = await AdminRepository.getTopicById(input.topicId);
      if (!topic) {
        throw new AdminApiError("Topic not found", 404);
      }
      if (input.type === "MCQ" && (!input.options || input.options.length < 2)) {
        throw new AdminApiError("MCQ questions must have at least 2 options", 400);
      }

      if (input.type === "MCQ") {
        const correctCount = input.options!.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          throw new AdminApiError("MCQ questions must have exactly one correct option", 400);
        }
      }
    }

    const question = await AdminRepository.createQuestion({
      topicId: input.topicId ?? null,
      type: input.type,
      difficulty: input.difficulty,
      questionText: input.questionText,
      explanation: input.explanation,
      options: input.options ?? [],
    });

    return question;
  }

  static async listQuestions(page: number, limit: number) {
    const questions = await AdminRepository.listQuestions(page, Math.min(limit, 100));
    const total = await AdminRepository.countQuestions();
    return { questions, total, page, limit: Math.min(limit, 100) };
  }

  static async deleteQuestion(id: string) {
    const existing = await AdminRepository.getQuestionById(id);
    if (!existing) {
      throw new AdminApiError("Question not found", 404);
    }
    await AdminRepository.deleteQuestion(id);
  }
}
