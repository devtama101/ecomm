import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSnapTransaction } from "@/actions/payment.action";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

// Mock dependencies
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
  },
}));

const { mockCreateTransaction } = vi.hoisted(() => ({
  mockCreateTransaction: vi.fn().mockResolvedValue({ token: "mock_snap_token" }),
}));

vi.mock("midtrans-client", () => {
  return {
    default: {
      Snap: vi.fn().mockImplementation(function () {
        return {
          createTransaction: mockCreateTransaction,
        };
      }),
    },
  };
});

describe("Phase 3: Midtrans Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail if user is not authenticated", async () => {
    (currentUser as any).mockResolvedValue(null);

    const result = await createSnapTransaction(1000);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Unauthorized");
  });

  it("should create a transaction and return a snap token", async () => {
    const mockUser = {
      id: "clerk_123",
      emailAddresses: [{ emailAddress: "test@example.com" }],
      firstName: "Test",
      lastName: "User",
    };
    (currentUser as any).mockResolvedValue(mockUser);

    const mockDbUser = { id: "db_user_123", clerkId: "clerk_123" };
    (prisma.user.findUnique as any).mockResolvedValue(mockDbUser);
    (prisma.transaction.create as any).mockResolvedValue({ id: "txn_123" });

    const result = await createSnapTransaction(50000);

    expect(result.success).toBe(true);
    expect(result.snapToken).toBe("mock_snap_token");
    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 50000,
          status: "pending",
          userId: "db_user_123",
        }),
      })
    );
  });
});
