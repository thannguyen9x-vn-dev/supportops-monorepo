import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

jest.mock("@/features/canned-response/hooks/useCannedResponsePicker", () => ({
  useCannedResponsePicker: jest.fn(() => ({
    results: [],
    isOpen: false,
    setIsOpen: jest.fn(),
    query: "",
    setQuery: jest.fn(),
  })),
}));

jest.mock("@/features/canned-response/components/CannedResponsePicker", () => ({
  CannedResponsePicker: () => null,
}));

jest.mock("@/features/knowledge-base/components/KnowledgeBasePickerModal", () => ({
  KnowledgeBasePickerModal: ({ open, onSelect }: { open: boolean; onSelect: (item: { id: string; title: string }) => void }) =>
    open ? (
      <button
        onClick={() => onSelect({ id: "kb-1", title: "How to reset password" })}
        type="button"
      >
        pick-kb-item
      </button>
    ) : null,
}));

jest.mock("@/features/service-ops/requests/components/activity/comments/MentionTextArea", () => ({
  MentionTextArea: ({ value, onChange }: { value: string; onChange: (next: string) => void }) => (
    <textarea
      aria-label="comment"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  ),
}));

import { CommentComposer } from "@/features/service-ops/requests/components/activity/comments/CommentComposer";

describe("CommentComposerKnowledgeBase", () => {
  it("inserts markdown knowledge-base link when item is selected", async () => {
    const onCommentChange = jest.fn();

    render(
      <CommentComposer
        assigneeName="Tech A"
        canCreateInternal
        comment="Need help: "
        inputRef={{ current: null }}
        isInternalNote={false}
        isSubmitting={false}
        mentionOptions={[]}
        onCommentChange={onCommentChange}
        onInternalChange={jest.fn()}
        onSubmit={async () => {}}
        requestCode="REQ-100"
        requesterName="Alice"
      />
    );

    const kbButton = screen.getAllByRole("button").at(0);
    expect(kbButton).toBeDefined();
    if (!kbButton) {
      return;
    }

    await userEvent.click(kbButton);
    await userEvent.click(screen.getByRole("button", { name: "pick-kb-item" }));

    expect(onCommentChange).toHaveBeenCalledWith(
      "Need help: [How to reset password](http://localhost/knowledge-base/kb-1)"
    );
  });
});
