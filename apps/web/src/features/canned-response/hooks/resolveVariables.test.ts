import { resolveVariables } from "./resolveVariables";

describe("resolveVariables", () => {
  it("replaces all placeholders", () => {
    const content = "Hi {{requester_name}}, ticket {{request_code}} is handled by {{assignee_name}}.";

    const result = resolveVariables(content, {
      requesterName: "Alice",
      requestCode: "REQ-123",
      assigneeName: "Tech Bob",
    });

    expect(result).toBe("Hi Alice, ticket REQ-123 is handled by Tech Bob.");
  });
});
