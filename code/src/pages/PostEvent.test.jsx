import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSession = vi.fn();
const mockCategoryOrder = vi.fn();
const mockUserMaybeSingle = vi.fn();
const mockEventsInsert = vi.fn();

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
    from: vi.fn((table) => {
      if (table === "categories") {
        return {
          select: vi.fn(() => ({
            order: mockCategoryOrder,
          })),
        };
      }

      if (table === "users") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mockUserMaybeSingle,
            })),
          })),
        };
      }

      if (table === "events") {
        return {
          insert: mockEventsInsert,
        };
      }

      return {};
    }),
  },
}));

import PostEvent from "./PostEvent";

describe("PostEvent", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockCategoryOrder.mockReset();
    mockUserMaybeSingle.mockReset();
    mockEventsInsert.mockReset();

    mockCategoryOrder.mockResolvedValue({
      data: [
        { id: "cat-1", name: "Community Events" },
        { id: "cat-2", name: "Crisis Support" },
        { id: "cat-3", name: "Disability Services" },
        { id: "cat-4", name: "Education" },
        { id: "cat-5", name: "Employment" },
        { id: "cat-6", name: "Family Services" },
        { id: "cat-7", name: "Financial Support" },
        { id: "cat-8", name: "Food Assistance" },
        { id: "cat-9", name: "Health & Wellness" },
        { id: "cat-10", name: "Housing & Shelter" },
        { id: "cat-11", name: "Legal Aid" },
        { id: "cat-12", name: "Mental Health" },
        { id: "cat-13", name: "Recreation" },
        { id: "cat-14", name: "Seniors" },
        { id: "cat-15", name: "Transportation" },
        { id: "cat-16", name: "Veteran Services" },
        { id: "cat-17", name: "Volunteer Opportunities" },
        { id: "cat-18", name: "Youth Programs" },
      ],
      error: null,
    });

    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    });

    mockUserMaybeSingle.mockResolvedValue({
      data: { organization_id: "org-123" },
      error: null,
    });

    mockEventsInsert.mockResolvedValue({ error: null });
  });

  it("loads db categories and submits a pending event request", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PostEvent />
      </MemoryRouter>
    );

    expect(screen.getByText("Step 1: Basic Information")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Community Events" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Volunteer Opportunities" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Youth Programs" })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Event Title"), "Community Potluck");
    await user.selectOptions(screen.getByLabelText("Category"), "Volunteer Opportunities");
    await user.type(screen.getByLabelText("Event Description"), "Bring a dish to share.");
    await user.click(screen.getByRole("button", { name: "Continue to Date & Location" }));

    expect(screen.getByText("Step 2: When & Where")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Event Date"), "2026-04-12");
    await user.type(screen.getByLabelText("Start Time"), "16:00");
    await user.type(screen.getByLabelText("End Time"), "18:00");
    await user.type(screen.getByLabelText("Location"), "City Hall");
    await user.click(screen.getByRole("button", { name: "Continue to Flyer Upload" }));

    expect(screen.getByText("Step 3: Event Flyer (Optional)")).toBeInTheDocument();
    expect(screen.getByText(/Community Potluck/)).toBeInTheDocument();
    expect(screen.getByText(/City Hall/)).toBeInTheDocument();
    expect(screen.getByText(/4:00 PM - 6:00 PM/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit for Review" }));

    await waitFor(() => {
      expect(mockEventsInsert).toHaveBeenCalledWith([
        {
          title: "Community Potluck",
          description: "Bring a dish to share.",
          start_datetime: "2026-04-12T16:00:00",
          end_datetime: "2026-04-12T18:00:00",
          location: "City Hall",
          created_by: "user-1",
          category_id: "cat-17",
          organization_id: "org-123",
          status: "pending",
        },
      ]);
    });

    expect(
      await screen.findByText("Your event request was submitted for review.")
    ).toBeInTheDocument();
  });
});
