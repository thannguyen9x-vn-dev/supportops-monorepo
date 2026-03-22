import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
    it("disables submit when form is invalid", async () => {
      render(<SlaSettingsView />);

      const serviceTypeInput = await screen.findByLabelText("form.fields.serviceTypeCode");
      const createButton = screen.getByRole("button", { name: "actions.create" });
      expect((createButton as HTMLButtonElement).disabled).toBe(true);

      await userEvent.type(serviceTypeInput, "HVAC");
      expect((createButton as HTMLButtonElement).disabled).toBe(false);

      await userEvent.clear(serviceTypeInput);
      expect((createButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("submits valid payload", async () => {
      render(<SlaSettingsView />);

      const serviceTypeInput = await screen.findByLabelText("form.fields.serviceTypeCode");
      await userEvent.type(serviceTypeInput, "hvac");
      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));

      await waitFor(() =>
        expect(mockService.saveSlaPolicy).toHaveBeenCalledWith(
          expect.objectContaining({
            serviceTypeCode: "HVAC",
            responseMinutes: 30,
            resolutionMinutes: 480,
            escalationAfterMinutes: 60,
          }),
        ),
      );
    });

    it("requires delete confirmation", async () => {
      render(<SlaSettingsView />);
      await screen.findByText(/HVAC - 30\/480\/60/);

      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValueOnce(false);
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      expect(mockService.deleteSlaPolicy).not.toHaveBeenCalled();
      expect(confirmSpy).toHaveBeenCalled();

      confirmSpy.mockReturnValueOnce(true);
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      await waitFor(() => expect(mockService.deleteSlaPolicy).toHaveBeenCalledWith("policy-hvac"));
      confirmSpy.mockRestore();
    });
  });

  describe("ServiceTypesSettingsView", () => {
    it("disables submit when form is invalid", async () => {
      render(<ServiceTypesSettingsView />);

      const codeInput = await screen.findByLabelText("form.fields.code");
      const nameInput = screen.getByLabelText("form.fields.name");
      const createButton = screen.getByRole("button", { name: "actions.create" });

      expect((createButton as HTMLButtonElement).disabled).toBe(true);
      await userEvent.type(codeInput, "NET");
      expect((createButton as HTMLButtonElement).disabled).toBe(true);
      await userEvent.type(nameInput, "Network");
      expect((createButton as HTMLButtonElement).disabled).toBe(false);
    });

    it("submits valid payload", async () => {
      render(<ServiceTypesSettingsView />);

      await userEvent.type(await screen.findByLabelText("form.fields.code"), "network");
      await userEvent.type(screen.getByLabelText("form.fields.name"), " Network ");
      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));

      await waitFor(() =>
        expect(mockService.saveServiceType).toHaveBeenCalledWith(
          expect.objectContaining({
            code: "NETWORK",
            name: "Network",
          }),
        ),
      );
    });

    it("requires delete confirmation", async () => {
      render(<ServiceTypesSettingsView />);
      await screen.findByText(/HVAC - HVAC/);

      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValueOnce(false);
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      expect(mockService.deleteServiceType).not.toHaveBeenCalled();
      expect(confirmSpy).toHaveBeenCalled();

      confirmSpy.mockReturnValueOnce(true);
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      await waitFor(() => expect(mockService.deleteServiceType).toHaveBeenCalledWith("st-hvac"));
      confirmSpy.mockRestore();
    });
  });

  describe("WorkflowSettingsView", () => {
    it("disables submit when form is invalid", async () => {
      render(<WorkflowSettingsView />);

      const serviceTypeInput = await screen.findByLabelText("form.fields.serviceTypeCode");
      const fromStatusInput = screen.getByLabelText("form.fields.fromStatus");
      const toStatusInput = screen.getByLabelText("form.fields.toStatus");
      const rolesInput = screen.getByLabelText("form.fields.allowedRoles");
      const createButton = screen.getByRole("button", { name: "actions.create" });

      expect((createButton as HTMLButtonElement).disabled).toBe(true);
      await userEvent.type(serviceTypeInput, "HVAC");
      await userEvent.type(fromStatusInput, "SUBMITTED");
      await userEvent.type(toStatusInput, "TRIAGE");
      expect((createButton as HTMLButtonElement).disabled).toBe(true);
      await userEvent.type(rolesInput, "TENANT_ADMIN");
      expect((createButton as HTMLButtonElement).disabled).toBe(false);
    });

    it("submits valid payload", async () => {
      render(<WorkflowSettingsView />);

      await userEvent.type(await screen.findByLabelText("form.fields.serviceTypeCode"), "hvac");
      await userEvent.type(screen.getByLabelText("form.fields.fromStatus"), "submitted");
      await userEvent.type(screen.getByLabelText("form.fields.toStatus"), "triage");
      await userEvent.type(screen.getByLabelText("form.fields.allowedRoles"), "tenant_admin, agent");

      await userEvent.click(screen.getByRole("button", { name: "actions.create" }));

      await waitFor(() =>
        expect(mockService.saveWorkflowTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            serviceTypeCode: "HVAC",
            fromStatus: "SUBMITTED",
            toStatus: "TRIAGE",
            allowedRoles: ["TENANT_ADMIN", "AGENT"],
          }),
        ),
      );
    });

    it("requires delete confirmation", async () => {
      render(<WorkflowSettingsView />);
      await screen.findByText(/HVAC: SUBMITTED/);

      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValueOnce(false);
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      expect(mockService.deleteWorkflowTransition).not.toHaveBeenCalled();
      expect(confirmSpy).toHaveBeenCalled();

      confirmSpy.mockReturnValueOnce(true);
      await userEvent.click(screen.getByRole("button", { name: "actions.delete" }));
      await waitFor(() => expect(mockService.deleteWorkflowTransition).toHaveBeenCalledWith("wf-1"));
      confirmSpy.mockRestore();
    });
  });
});
