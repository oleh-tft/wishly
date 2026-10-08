import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { login, register, getToken, clearToken } from "./auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOk(body: object) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.payload";
const FAKE_RESPONSE = { access_token: FAKE_TOKEN, token_type: "bearer" };

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal("fetch", mockFetchOk(FAKE_RESPONSE));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// getToken()
// ---------------------------------------------------------------------------

describe("getToken", () => {
  it("returns null when both storages are empty", () => {
    expect(getToken()).toBeNull();
  });

  it("returns token from localStorage", () => {
    localStorage.setItem("token", FAKE_TOKEN);
    expect(getToken()).toBe(FAKE_TOKEN);
  });

  it("returns token from sessionStorage when localStorage is empty", () => {
    sessionStorage.setItem("token", FAKE_TOKEN);
    expect(getToken()).toBe(FAKE_TOKEN);
  });

  it("prefers localStorage over sessionStorage", () => {
    localStorage.setItem("token", "local-token");
    sessionStorage.setItem("token", "session-token");
    expect(getToken()).toBe("local-token");
  });
});

// ---------------------------------------------------------------------------
// clearToken()
// ---------------------------------------------------------------------------

describe("clearToken", () => {
  it("removes token from both storages and clears rememberMe flag", () => {
    localStorage.setItem("token", FAKE_TOKEN);
    sessionStorage.setItem("token", FAKE_TOKEN);
    localStorage.setItem("rememberMe", "true");

    clearToken();

    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("rememberMe")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// login()
// ---------------------------------------------------------------------------

describe("login — storage behaviour", () => {
  it("stores token in localStorage and sets rememberMe flag when rememberMe=true", async () => {
    await login("test@example.com", "password123", true);

    expect(localStorage.getItem("token")).toBe(FAKE_TOKEN);
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("rememberMe")).toBe("true");
  });

  it("stores token in sessionStorage only when rememberMe=false", async () => {
    await login("test@example.com", "password123", false);

    expect(sessionStorage.getItem("token")).toBe(FAKE_TOKEN);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("rememberMe")).toBeNull();
  });

  it("defaults to rememberMe=false (sessionStorage) when flag is omitted", async () => {
    await login("test@example.com", "password123");

    expect(sessionStorage.getItem("token")).toBe(FAKE_TOKEN);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("passes remember_me=true in the request body when rememberMe=true", async () => {
    await login("test@example.com", "password123", true);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        body: expect.stringContaining('"remember_me":true'),
      }),
    );
  });

  it("passes remember_me=false in the request body when rememberMe=false", async () => {
    await login("test@example.com", "password123", false);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        body: expect.stringContaining('"remember_me":false'),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// register()
// ---------------------------------------------------------------------------

describe("register — storage behaviour", () => {
  it("always stores token in localStorage (persistent session)", async () => {
    await register("Alice", "alice@example.com", "password123");

    expect(localStorage.getItem("token")).toBe(FAKE_TOKEN);
    expect(sessionStorage.getItem("token")).toBeNull();
  });
});
