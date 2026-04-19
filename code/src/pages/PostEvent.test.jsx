import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const {
  mockNavigate,
  mockGetSession,
  mockCategoryOrder,
  mockTagOrder,
  mockUserMaybeSingle,
  mockEventsInsert,
  mockEventTagsInsert,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGetSession: vi.fn(),
  mockCategoryOrder: vi.fn(),
  mockTagOrder: vi.fn(),
  mockUserMaybeSingle: vi.fn(),
  mockEventsInsert: vi.fn(),
  mockEventTagsInsert: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

      if (table === "tags") {
        return {
          select: vi.fn(() => ({
            order: mockTagOrder,
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

      if (table === "event_tags") {
        return {
          insert: mockEventTagsInsert,
        };
      }

      return {};
    }),
  },
}));

import PostEvent from "./PostEvent";

describe("PostEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

    mockTagOrder.mockResolvedValue({
      data: [
        { id: "tag-1", name: "Community" },
        { id: "tag-2", name: "Family Friendly" },
        { id: "tag-3", name: "Outdoor" },
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

    mockEventsInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: { id: "event-1" },
          error: null,
        }),
      })),
    });

    mockEventTagsInsert.mockResolvedValue({ error: null });
  });

  it("loads db categories and submits a pending multi-day online event request", async () => {
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
      expect(screen.getByRole("button", { name: "Community" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Family Friendly" })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/event title/i), "Community Potluck");
    await user.selectOptions(screen.getByLabelText(/category/i), "Volunteer Opportunities");
    await user.click(screen.getByRole("button", { name: "Community" }));
    await user.click(screen.getByRole("button", { name: "Outdoor" }));
    await user.type(screen.getByLabelText(/event description/i), "Bring a dish to share.");
    await user.click(screen.getByRole("button", { name: "Continue to Date & Location" }));

    expect(screen.getByText("Step 2: When & Where")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/start date/i), "2026-04-12");
    await user.type(screen.getByLabelText(/end date/i), "2026-04-13");
    await user.type(screen.getByLabelText(/start time/i), "16:00");
    await user.type(screen.getByLabelText(/end time/i), "18:00");
    await user.type(screen.getByLabelText(/location or zoom link/i), "https://zoom.us/j/123456789");
    await user.click(screen.getByRole("button", { name: "Continue to Flyer Upload" }));

    expect(screen.getByText("Step 3: Event Flyer (Optional)")).toBeInTheDocument();
    expect(screen.getByText(/Community Potluck/)).toBeInTheDocument();
    expect(screen.getByText(/Community, Outdoor/)).toBeInTheDocument();
    expect(screen.getByText(/April 12, 2026 - April 13, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/4:00 PM - 6:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/^Online$/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/zoom\.us\/j\/123456789/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit for Review" }));

    await waitFor(() => {
      expect(mockEventsInsert).toHaveBeenCalledWith([
        {
          title: "Community Potluck",
          description: "Bring a dish to share.",
          start_datetime: "2026-04-12T16:00:00",
          end_datetime: "2026-04-13T18:00:00",
          location: "Online",
          volunteer_url: "https://zoom.us/j/123456789",
          created_by: "user-1",
          category_id: "cat-17",
          organization_id: "org-123",
          status: "pending",
        },
      ]);

      expect(mockEventTagsInsert).toHaveBeenCalledWith([
        { event_id: "event-1", tag_id: "tag-1" },
        { event_id: "event-1", tag_id: "tag-3" },
      ]);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/events", {
      state: {
        flashMessage: "Your event request was successfully sent and is now pending review.",
        flashType: "success",
      },
    });
  });

  it("blocks submission when the volunteer URL exceeds 50 characters", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PostEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Community Events" })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/event title/i), "Community Potluck");
    await user.type(screen.getByLabelText(/event description/i), "Bring a dish to share.");
    await user.click(screen.getByRole("button", { name: "Continue to Date & Location" }));

    await user.type(screen.getByLabelText(/start date/i), "2026-04-12");
    await user.type(screen.getByLabelText(/end date/i), "2026-04-12");
    await user.type(screen.getByLabelText(/start time/i), "16:00");
    await user.type(screen.getByLabelText(/end time/i), "18:00");
    await user.type(
      screen.getByLabelText(/location or zoom link/i),
      "https://example.com/abcdefghijklmnopqrstuvwxyz1234567890"
    );

    expect(screen.getByText("Volunteer URL must be 50 characters or less.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue to Flyer Upload" })).toBeDisabled();
  });

  it("blocks submission when the volunteer URL is not a valid http(s) URL", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PostEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Community Events" })).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/event title/i), "Community Potluck");
    await user.type(screen.getByLabelText(/event description/i), "Bring a dish to share.");
    await user.click(screen.getByRole("button", { name: "Continue to Date & Location" }));

    await user.type(screen.getByLabelText(/start date/i), "2026-04-12");
    await user.type(screen.getByLabelText(/end date/i), "2026-04-12");
    await user.type(screen.getByLabelText(/start time/i), "16:00");
    await user.type(screen.getByLabelText(/end time/i), "18:00");
    await user.type(screen.getByLabelText(/location or zoom link/i), "ftp://example.com/bad");

    expect(screen.getByText("Volunteer URL must be a valid http(s) address.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue to Flyer Upload" })).toBeDisabled();
  });
});
