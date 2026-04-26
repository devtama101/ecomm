import { describe, it, expect, vi } from 'vitest'
import { proxy } from './proxy'

describe('Proxy', () => {
  it('should protect /dashboard routes', async () => {
    const mockReq = { url: 'http://localhost:3000/dashboard' } as any
    const mockAuth = { protect: vi.fn() }
    
    // proxy returns our mock from vitest.setup.ts
    // In vitest.setup.ts we mapped clerkMiddleware to return the handler directly
    await (proxy as any)(mockAuth, mockReq)
    
    expect(mockAuth.protect).toHaveBeenCalled()
  })

  it('should not protect public routes', async () => {
    const mockReq = { url: 'http://localhost:3000/' } as any
    const mockAuth = { protect: vi.fn() }
    
    await (proxy as any)(mockAuth, mockReq)
    
    expect(mockAuth.protect).not.toHaveBeenCalled()
  })
})
