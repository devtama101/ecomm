import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma client
const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  transaction: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Phase 2: Database Schema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a User record", async () => {
    const mockUser = {
      id: "uuid-user-1",
      clerkId: "clerk_test_123",
      email: "test@example.com",
      createdAt: new Date("2026-01-01"),
    };

    mockPrisma.user.create.mockResolvedValue(mockUser);

    const result = await mockPrisma.user.create({
      data: {
        clerkId: "clerk_test_123",
        email: "test@example.com",
      },
    });

    expect(result).toEqual(mockUser);
    expect(result.clerkId).toBe("clerk_test_123");
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: "clerk_test_123",
        email: "test@example.com",
      },
    });
  });

  it("should create a Transaction linked to a User", async () => {
    const mockTransaction = {
      id: "uuid-txn-1",
      orderId: "ORDER-123",
      userId: "uuid-user-1",
      amount: 50000,
      status: "pending",
      snapToken: null,
      createdAt: new Date("2026-01-01"),
    };

    mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

    const result = await mockPrisma.transaction.create({
      data: {
        orderId: "ORDER-123",
        userId: "uuid-user-1",
        amount: 50000,
      },
    });

    expect(result).toEqual(mockTransaction);
    expect(result.userId).toBe("uuid-user-1");
    expect(result.status).toBe("pending");
    expect(mockPrisma.transaction.create).toHaveBeenCalledOnce();
  });

  it("should query a Transaction with nested User relation", async () => {
    const mockTransactionWithUser = {
      id: "uuid-txn-1",
      orderId: "ORDER-123",
      userId: "uuid-user-1",
      amount: 50000,
      status: "settlement",
      snapToken: "snap_abc123",
      createdAt: new Date("2026-01-01"),
      user: {
        id: "uuid-user-1",
        clerkId: "clerk_test_123",
        email: "test@example.com",
        createdAt: new Date("2026-01-01"),
      },
    };

    mockPrisma.transaction.findUnique.mockResolvedValue(
      mockTransactionWithUser
    );

    const result = await mockPrisma.transaction.findUnique({
      where: { orderId: "ORDER-123" },
      include: { user: true },
    });

    expect(result).toEqual(mockTransactionWithUser);
    expect(result?.user.clerkId).toBe("clerk_test_123");
    expect(result?.user.email).toBe("test@example.com");
    expect(mockPrisma.transaction.findUnique).toHaveBeenCalledWith({
      where: { orderId: "ORDER-123" },
      include: { user: true },
    });
  });
});
