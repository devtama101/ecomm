import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DashboardPage from './page'

describe('Dashboard Page', () => {
  it('renders user information correctly', async () => {
    const page = await DashboardPage()
    render(page)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/test_user_id/)).toBeInTheDocument()
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/Test User/)).toBeInTheDocument()
  })
})
