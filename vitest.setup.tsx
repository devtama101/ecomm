import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Clerk components and hooks
vi.mock('@clerk/nextjs', () => {
  return {
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    SignInButton: ({ children }: { children: React.ReactNode }) => <button data-testid="sign-in-btn">{children}</button>,
    UserButton: () => <button data-testid="user-btn">User</button>,
  }
})

vi.mock('@clerk/nextjs/server', () => {
  return {
    auth: () => new Promise((resolve) => resolve({ userId: 'test_user_id' })),
    currentUser: () => new Promise((resolve) => resolve({ 
      id: 'test_user_id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User'
    })),
    clerkMiddleware: (handler: any) => handler,
    createRouteMatcher: () => (req: any) => req.url.includes('/dashboard'),
  }
})
