import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignInForm } from "./SignInForm";

describe("SignInForm Social Logins", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete (window as any).location;
    (window as any).location = {
      ...originalLocation,
      origin: "http://localhost:5173",
      href: "",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          redirect_uris: ["http://localhost:8000/api/auth/google/callback"],
          console_url: "https://console.cloud.google.com/apis/credentials",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("should render Google button as disabled when API URL is missing", () => {
    vi.stubEnv("VITE_API_URL", "");

    render(<SignInForm />);

    const googleBtn = screen.getByLabelText("Увійти через Google");
    expect(googleBtn).toBeDisabled();
    expect(googleBtn).toHaveTextContent("Sign in with Google (Temporarily unavailable)");
  });

  it("should redirect to API Google OAuth start when configured", async () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:8000");

    render(<SignInForm />);

    const googleBtn = screen.getByLabelText("Увійти через Google");
    await waitFor(() => {
      expect(googleBtn).not.toBeDisabled();
    });

    fireEvent.click(googleBtn);

    expect(window.location.href).toBe("http://localhost:8000/api/auth/google/start");
  });
});
describe("SignInForm Validation", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "");
    // Prevent any accidental real fetch calls
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "tok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("shows an inline error when name exceeds 50 characters", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);

    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "A".repeat(51) },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText(/Name must be 50 characters or fewer/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows an inline error when name contains non-ASCII characters", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);

    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "ก็็็็็็็็็็" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText(/Name may only contain Latin letters/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows an inline error when password is shorter than 8 characters", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);

    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "short" },
    });
    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText(/Password must be between 8 and 50 characters/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows an inline error when password exceeds 50 characters", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);

    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "p".repeat(51) },
    });
    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText(/Password must be between 8 and 50 characters/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not show validation errors and submits when input is valid", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);

    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Електронна пошта"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "validPass1" },
    });
    fireEvent.submit(screen.getByRole("form"));

    // No validation error messages
    await waitFor(() => {
      expect(
        screen.queryByText(/Name must be 50 characters or fewer/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Name may only contain Latin letters/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Password must be between 8 and 50 characters/i),
      ).not.toBeInTheDocument();
    });

    // Fetch was called (API request was attempted)
    expect(fetch).toHaveBeenCalled();
  });
});

describe("SignInForm Email Validation", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "tok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  /** Helper: fill name + password with valid values, then submit */
  function fillCommonFields() {
    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "password123" },
    });
  }

  it("shows a required error when email is empty on submit", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);
    fillCommonFields();
    // Leave email empty (default value is "")
    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText(/Email address is required/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["test@", "missing domain"],
    ["@test.com", "missing local part"],
    ["plaintext", "no @ symbol"],
    ["test@@test.com", "double @"],
  ])("shows a format error for malformed email: %s (%s)", async (email) => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);
    fillCommonFields();
    fireEvent.change(screen.getByLabelText("Електронна пошта"), {
      target: { value: email },
    });
    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText(/Please enter a valid email address/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows a length error when email exceeds 254 characters", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);
    fillCommonFields();
    // 243 'a's + "@example.com" = 255 chars total
    const longEmail = "a".repeat(243) + "@example.com";
    fireEvent.change(screen.getByLabelText("Електронна пошта"), {
      target: { value: longEmail },
    });
    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText(/Email must be 254 characters or fewer/i),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts a valid edge-case email like user+tag@example.co.uk", async () => {
    render(<SignInForm mode="register" submitLabel="Sign up" />);
    fillCommonFields();
    fireEvent.change(screen.getByLabelText("Електронна пошта"), {
      target: { value: "user+tag@example.co.uk" },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.queryByText(/Please enter a valid email address/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Email address is required/i),
      ).not.toBeInTheDocument();
    });
    // A valid email should let the request through
    expect(fetch).toHaveBeenCalled();
  });
});

describe("SignInForm Email Domain Validation", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "tok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function fillNameAndPassword() {
    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "password123" },
    });
  }

  it.each([
    ["1@1.com",          "all-numeric domain label"],
    ["test@123.com",     "all-numeric subdomain"],
    ["1@цацац.com",      "Cyrillic domain (existing)"],
    ["q@цаца.com",       "Cyrillic domain (short, reporter case)"],
    ["test@пример.com",  "Cyrillic subdomain"],
    ["test@пример.рф",   "fully non-ASCII domain + TLD"],
    ["test@münchen.de",  "non-ASCII Latin-adjacent (ü)"],
  ])(
    "rejects email with an invalid domain: %s (%s)",
    async (email) => {
      render(<SignInForm mode="register" submitLabel="Sign up" />);
      fillNameAndPassword();
      fireEvent.change(screen.getByLabelText("Електронна пошта"), {
        target: { value: email },
      });
      fireEvent.submit(screen.getByRole("form"));

      expect(
        await screen.findByText(/Please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["a@b.co",            "short but valid domain with a letter"],
    ["test@example.com",  "standard valid email"],
    ["test@ex1.com",      "domain has letters and digits"],
    ["test@ex-ample.com", "hyphen in domain label is allowed"],
  ])(
    "accepts email with a valid domain: %s (%s)",
    async (email) => {
      render(<SignInForm mode="register" submitLabel="Sign up" />);
      fillNameAndPassword();
      fireEvent.change(screen.getByLabelText("Електронна пошта"), {
        target: { value: email },
      });
      fireEvent.submit(screen.getByRole("form"));

      await waitFor(() => {
        expect(
          screen.queryByText(/Please enter a valid email address/i),
        ).not.toBeInTheDocument();
      });
      expect(fetch).toHaveBeenCalled();
    },
  );
});
