import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionDropdown, ActionItem } from "@/components/ui/molecules/action-dropdown";
import { Edit, Trash2 } from "lucide-react";

describe("ActionDropdown Component", () => {
  const mockEdit = vi.fn();
  const mockDelete = vi.fn();

  const actions: ActionItem[] = [
    {
      label: "Edit Product",
      icon: <Edit data-testid="edit-icon" />,
      onClick: mockEdit,
    },
    {
      label: "Delete Product",
      icon: <Trash2 data-testid="trash-icon" />,
      onClick: mockDelete,
      variant: "destructive",
    },
  ];

  it("renders trigger button with actions icon", () => {
    render(<ActionDropdown actions={actions} />);
    const triggerBtn = screen.getByLabelText("Actions menu");
    expect(triggerBtn).toBeInTheDocument();
  });

  it("opens dropdown menu when trigger button is clicked", () => {
    render(<ActionDropdown actions={actions} />);
    const triggerBtn = screen.getByLabelText("Actions menu");

    fireEvent.click(triggerBtn);

    expect(screen.getByText("Edit Product")).toBeInTheDocument();
    expect(screen.getByText("Delete Product")).toBeInTheDocument();
  });

  it("executes item onClick handler when menu option is selected", () => {
    render(<ActionDropdown actions={actions} />);
    fireEvent.click(screen.getByLabelText("Actions menu"));

    const editBtn = screen.getByText("Edit Product");
    fireEvent.click(editBtn);

    expect(mockEdit).toHaveBeenCalledTimes(1);
  });

  it("applies destructive styling to destructive action items", () => {
    render(<ActionDropdown actions={actions} />);
    fireEvent.click(screen.getByLabelText("Actions menu"));

    const deleteBtn = screen.getByText("Delete Product").closest("button");
    expect(deleteBtn).toHaveClass("text-rose-600");
  });

  it("disables disabled action items", () => {
    const disabledActions: ActionItem[] = [
      { label: "Archive", onClick: vi.fn(), disabled: true },
    ];
    render(<ActionDropdown actions={disabledActions} />);
    fireEvent.click(screen.getByLabelText("Actions menu"));

    const archiveBtn = screen.getByText("Archive").closest("button");
    expect(archiveBtn).toBeDisabled();
  });
});
