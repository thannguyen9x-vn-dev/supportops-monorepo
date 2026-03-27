import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/features/common/toast/ToastProvider";

import { ServiceTypesSettingsView } from "./ServiceTypesSettingsView";
import { SlaSettingsView } from "./SlaSettingsView";
import { WorkflowSettingsView } from "./WorkflowSettingsView";

jest.mock("../services/service-ops-settings.service", () => ({
  serviceOpsSettingsService: {
    listSlaPolicies: jest.fn(),
    saveSlaPolicy: jest.fn(),
    deleteSlaPolicy: jest.fn(),
    listServiceTypes: jest.fn(),
    saveServiceType: jest.fn(),
    deleteServiceType: jest.fn(),
    listWorkflowTransitions: jest.fn(),
    saveWorkflowTransition: jest.fn(),
    deleteWorkflowTransition: jest.fn(),
  },
}));

import { serviceOpsSettingsService } from "../services/service-ops-settings.service";

const mockService = serviceOpsSettingsService as jest.Mocked<typeof serviceOpsSettingsService>;

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>,
  );
}

function requireElement<T>(value: T | undefined): T {
  if (!value) {
    throw new Error("Expected element to exist");
  }
  return value;
}

describe("ServiceOps settings screens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockService.listSlaPolicies.mockResolvedValue([
      {
        id: "policy-hvac",
        serviceTypeCode: "HVAC",
        responseMinutes: 30,
        resolutionMinutes: 480,
        escalationAfterMinutes: 60,
      },
    ]);
    mockService.saveSlaPolicy.mockResolvedValue({
      id: "policy-new",
      serviceTypeCode: "HVAC",
      responseMinutes: 30,
      resolutionMinutes: 480,
      escalationAfterMinutes: 60,
    });
    mockService.deleteSlaPolicy.mockResolvedValue(undefined);

    mockService.listServiceTypes.mockResolvedValue([
      {
        id: "st-hvac",
        code: "HVAC",
        name: "HVAC",
        isActive: true,
      },
      {
        id: "st-network",
        code: "NETWORK",
        name: "Network",
        isActive: true,
      },
    ]);
    mockService.saveServiceType.mockResolvedValue({
      id: "st-new",
      code: "NETWORK",
      name: "Network",
      isActive: true,
    });
    mockService.deleteServiceType.mockResolvedValue(undefined);

    mockService.listWorkflowTransitions.mockResolvedValue([
      {
        id: "wf-1",
        serviceTypeCode: "HVAC",
        fromStatus: "SUBMITTED",
        toStatus: "TRIAGE",
        allowedRoles: ["TENANT_ADMIN"],
      },
    ]);
    mockService.saveWorkflowTransition.mockResolvedValue({
      id: "wf-new",
      serviceTypeCode: "HVAC",
      fromStatus: "SUBMITTED",
      toStatus: "TRIAGE",
      allowedRoles: ["TENANT_ADMIN"],
    });
    mockService.deleteWorkflowTransition.mockResolvedValue(undefined);
  });

  describe("SlaSettingsView", () => {
    it("does not submit invalid payload", async () => {
      renderWithProviders(<SlaSettingsView />);

      await userEvent.click(screen.getByRole("button", { name: "form.createTitle" }));
      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));
      await waitFor(() => expect(mockService.saveSlaPolicy).not.toHaveBeenCalled());
    });

    it("submits valid payload", async () => {
      renderWithProviders(<SlaSettingsView />);

      await userEvent.click(screen.getByRole("button", { name: "form.createTitle" }));
      const [serviceTypeSelect] = await screen.findAllByRole("combobox");
      await userEvent.click(requireElement(serviceTypeSelect));
      await userEvent.click(await screen.findByRole("option", { name: "NETWORK — Network" }));
      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));

      await waitFor(() =>
        expect(mockService.saveSlaPolicy).toHaveBeenCalledWith(
          expect.objectContaining({
            serviceTypeCode: "NETWORK",
            responseMinutes: 30,
            resolutionMinutes: 480,
            escalationAfterMinutes: 60,
          }),
        ),
      );
    });

    it("does not delete immediately without confirmation", async () => {
      renderWithProviders(<SlaSettingsView />);
      await screen.findByRole("button", { name: "actions.delete" });
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      await waitFor(() => expect(mockService.deleteSlaPolicy).not.toHaveBeenCalled());
    });
  });

  describe("ServiceTypesSettingsView", () => {
    it("does not submit invalid payload", async () => {
      renderWithProviders(<ServiceTypesSettingsView />);

      await userEvent.click(screen.getByRole("button", { name: "form.createTitle" }));
      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));
      await waitFor(() => expect(mockService.saveServiceType).not.toHaveBeenCalled());
    });

    it("submits valid payload", async () => {
      renderWithProviders(<ServiceTypesSettingsView />);

      await userEvent.click(screen.getByRole("button", { name: "form.createTitle" }));
      await userEvent.type(await screen.findByLabelText("form.fields.code"), "security");
      await userEvent.type(screen.getByLabelText("form.fields.name"), " Security ");
      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));

      await waitFor(() =>
        expect(mockService.saveServiceType).toHaveBeenCalledWith(
          expect.objectContaining({
            code: "SECURITY",
            name: "Security",
          }),
        ),
      );
    });

    it("does not delete immediately without confirmation", async () => {
      renderWithProviders(<ServiceTypesSettingsView />);
      const deleteButtons = await screen.findAllByRole("button", { name: "actions.delete" });
      await userEvent.click(requireElement(deleteButtons[0]));
      await waitFor(() => expect(mockService.deleteServiceType).not.toHaveBeenCalled());
    });
  });

  describe("WorkflowSettingsView", () => {
    it("does not submit invalid payload", async () => {
      renderWithProviders(<WorkflowSettingsView />);

      await userEvent.click(screen.getByRole("button", { name: "form.createTitle" }));
      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));
      await waitFor(() => expect(mockService.saveWorkflowTransition).not.toHaveBeenCalled());
    });

    it("submits valid payload", async () => {
      renderWithProviders(<WorkflowSettingsView />);

      await userEvent.click(screen.getByRole("button", { name: "form.createTitle" }));
      const [serviceTypeSelect, fromStatusSelect, toStatusSelect, allowedRolesSelect] = await screen.findAllByRole("combobox");

      await userEvent.click(requireElement(serviceTypeSelect));
      await userEvent.click(await screen.findByRole("option", { name: "HVAC — HVAC" }));

      await userEvent.click(requireElement(fromStatusSelect));
      await userEvent.click(await screen.findByRole("option", { name: "SUBMITTED" }));

      await userEvent.click(requireElement(toStatusSelect));
      await userEvent.click(await screen.findByRole("option", { name: "TRIAGE" }));

      await userEvent.click(requireElement(allowedRolesSelect));
      await userEvent.click(await screen.findByRole("option", { name: "TENANT_ADMIN" }));
      await userEvent.click(await screen.findByRole("option", { name: "TECHNICIAN" }));
      await userEvent.keyboard("{Escape}");

      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));

      await waitFor(() =>
        expect(mockService.saveWorkflowTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            serviceTypeCode: "HVAC",
            fromStatus: "SUBMITTED",
            toStatus: "TRIAGE",
            allowedRoles: ["TENANT_ADMIN", "TECHNICIAN"],
          }),
        ),
      );
    });

    it("does not delete immediately without confirmation", async () => {
      renderWithProviders(<WorkflowSettingsView />);
      await screen.findByRole("button", { name: "actions.delete" });
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      await waitFor(() => expect(mockService.deleteWorkflowTransition).not.toHaveBeenCalled());
    });
  });
});
