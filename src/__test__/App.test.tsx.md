import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../App";
import { getData } from "../services/get_data_services";

jest.mock("../services/get_data_services", () => ({
  getData: jest.fn(),
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders search input and button", () => {
    renderWithProviders(<App />);
    expect(screen.getByPlaceholderText("Enter Username")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  test("displays validation message when searching with empty input", () => {
    renderWithProviders(<App />);
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.click(searchButton);

    expect(
      screen.getByText("Please enter a username before searching.")
    ).toBeInTheDocument();
  });

  test("displays validation when no users are found", async () => {
    getData.mockResolvedValueOnce({ items: [] });
    renderWithProviders(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter Username"), {
      target: { value: "nonexistentuser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Cannot find user, please try another one.")
      ).toBeInTheDocument();
    });
  });

  test("displays users when search returns results", async () => {
    getData.mockResolvedValueOnce({ items: [{ id: 1, login: "testuser" }] });
    renderWithProviders(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter Username"), {
      target: { value: "testuser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });
  });

  test("displays repositories when a user is selected", async () => {
    getData.mockResolvedValueOnce({ items: [{ id: 1, login: "testuser" }] });
    getData.mockResolvedValueOnce([
      { id: 101, name: "Repo 1", stargazers_count: 10 },
    ]);
    renderWithProviders(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter Username"), {
      target: { value: "testuser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("testuser"));

    await waitFor(() => {
      expect(screen.getByText("Repo 1")).toBeInTheDocument();
    });
  });
});
