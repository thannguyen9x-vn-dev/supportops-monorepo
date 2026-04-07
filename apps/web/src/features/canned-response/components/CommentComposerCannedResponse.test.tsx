import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen } from "@testing-library/react";

const setQuery = jest.fn();
const setIsOpen = jest.fn();

jest.mock("@/features/canned-response/hooks/useCannedResponsePicker", () => ({
  useCannedResponsePicker: jest.fn(() => ({
    results: [
      { id: "c-1", title: "Reset", shortcut: "reset", body: "Hi {{requester_name}} (#{{request_code}}) - {{assignee_name}}" },
    ],
    isOpen: true,
    setIsOpen,
    query: "",
    setQuery,
  })),
}));

jest.mock("@/features/knowledge-base/components/KnowledgeBasePickerModal", () => ({
  KnowledgeBasePickerModal: () => null,
}));

jest.mock("@/features/service-ops/requests/components/activity/comments/MentionTextArea", () => ({
  MentionTextArea: ({ value, onChange, onKeyDown }: { value: string; onChange: (next: string) => void; onKeyDown?: (event: KeyboardEvent) => void }) => (
    <textarea
      aria-label="comment"
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => onKeyDown?.(event.nativeEvent)}
      value={value}
    />
  ),
}));

import { CommentComposer } from "@/features/service-ops/requests/components/activity/comments/CommentComposer";

describe("CommentComposerCannedResponse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens picker and updates shortcut query when typing /res", async () => {
    render(
      <CommentComposer
        assigneeName="Tech Bob"
        canCreateInternal
        comment=""
        inputRef={{ current: null }}
        isInternalNote={false}
        isSubmitting={false}
        mentionOptions={[]}
        onCommentChange={jest.fn()}
        onInternalChange={jest.fn()}
        onSubmit={async () => {}}
        requestCode="REQ-1"
        requesterName="Alice"
      />
    );

    fireEvent.change(screen.getByLabelText("comment"), { target: { value: "/res" } });

    expect(setQuery).toHaveBeenLastCalledWith("res");
    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it("closes picker on Escape", () => {
    render(
      <CommentComposer
        assigneeName="Tech Bob"
        canCreateInternal
        comment="/res"
        inputRef={{ current: null }}
        isInternalNote={false}
        isSubmitting={false}
        mentionOptions={[]}
        onCommentChange={jest.fn()}
        onInternalChange={jest.fn()}
        onSubmit={async () => {}}
        requestCode="REQ-1"
        requesterName="Alice"
      />
    );

    fireEvent.keyDown(screen.getByLabelText("comment"), { key: "Escape" });

    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("replaces composer text with resolved canned response on select", async () => {
    const onCommentChange = jest.fn();

    render(
      <CommentComposer
        assigneeName="Tech Bob"
        canCreateInternal
        comment="/reset"
        inputRef={{ current: null }}
        isInternalNote={false}
        isSubmitting={false}
        mentionOptions={[]}
        onCommentChange={onCommentChange}
        onInternalChange={jest.fn()}
        onSubmit={async () => {}}
        requestCode="REQ-1"
        requesterName="Alice"
      />
    );

    await userEvent.click(screen.getByText("/reset · Reset"));

    expect(onCommentChange).toHaveBeenCalledWith("Hi Alice (#REQ-1) - Tech Bob");
  });
});
