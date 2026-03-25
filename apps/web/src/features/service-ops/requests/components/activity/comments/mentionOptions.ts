import type { RequestDetail } from "../../../types";
import type { MentionOption } from "./MentionTextArea";

export function buildMentionOptions(request: RequestDetail): MentionOption[] {
  const options = new Map<string, MentionOption>();

  if (request.requester.name.trim()) {
    options.set(request.requester.name.toLowerCase(), { id: request.requester.id, name: request.requester.name });
  }

  if (request.assignee?.name.trim()) {
    options.set(request.assignee.name.toLowerCase(), { id: request.assignee.id, name: request.assignee.name });
  }

  request.comments.forEach((comment) => {
    const authorName = comment.authorName.trim();
    if (!authorName) return;
    options.set(authorName.toLowerCase(), { id: `comment:${comment.id}`, name: authorName });
  });

  return Array.from(options.values());
}
