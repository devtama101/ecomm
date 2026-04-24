import { describe, it, expect, vi } from 'vitest'
import middleware from './middleware'

describe('Middleware', () => {
  it('should protect /dashboard routes', async () => {
    const mockReq = { url: 'http://localhost:3000/dashboard' } as any
    const mockAuth = { protect: vi.fn() }
    
    // middleware returns our mock from vitest.setup.ts
    // In vitest.setup.ts we mapped clerkMiddleware to return the handler directly
    await (middleware as any)(mockAuth, mockReq)
    
    expect(mockAuth.protect).toHaveBeenCalled()
  })

  it('should not protect public routes', async () => {
    const mockReq = { url: 'http://localhost:3000/' } as any
    const mockAuth = { protect: vi.fn() }
    
    await (middleware as any)(mockAuth, mockReq)
    
    expect(mockAuth.protect).not.toHaveBeenCalled()
  })
})
