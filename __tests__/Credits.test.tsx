import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdGenerator from '@/components/AdGenerator';
import { useCreditStore } from '@/services/creditStore';
import { creditService } from '@/services/creditService';
import { useAuthStore } from '@/services/authStore';

// Mock services
vi.mock('@/services/creditService');
vi.mock('@/services/geminiService');

describe('AdGenerator with Credit System', () => {
  beforeEach(() => {
    // Reset stores and mocks before each test
    useCreditStore.setState({ balance: 10, setBalance: (balance) => useCreditStore.setState({ balance }) });
    useAuthStore.setState({ user: { id: 'test-user' }, session: {}, setUser: () => {}, setSession: () => {} });
    vi.clearAllMocks();
  });

  it('should display the user credit balance', () => {
    render(<AdGenerator />);
    expect(screen.getByText('10 кредитов')).toBeInTheDocument();
  });

  it('should deduct credits on successful ad generation', async () => {
    const spendCreditsSpy = vi.spyOn(creditService, 'spendCredits').mockResolvedValue({ success: true, new_balance: 9 });
    
    render(<AdGenerator />);
    
    fireEvent.click(screen.getByText('Сгенерировать'));

    await waitFor(() => {
      expect(spendCreditsSpy).toHaveBeenCalledWith(1, 'Ad Generation');
      expect(useCreditStore.getState().balance).toBe(9);
    });
  });

  it('should not generate ad if credits are insufficient', async () => {
    useCreditStore.setState({ balance: 0 });
    const spendCreditsSpy = vi.spyOn(creditService, 'spendCredits');

    render(<AdGenerator />);
    fireEvent.click(screen.getByText('Сгенерировать'));

    await waitFor(() => {
      expect(spendCreditsSpy).not.toHaveBeenCalled();
      expect(screen.getByText('Недостаточно кредитов для генерации объявления.')).toBeInTheDocument();
    });
  });

  it('should deduct credits on successful ad optimization', async () => {
    const spendCreditsSpy = vi.spyOn(creditService, 'spendCredits').mockResolvedValue({ success: true, new_balance: 9 });

    render(<AdGenerator />);
    // First generate an ad to enable optimization
    fireEvent.click(screen.getByText('Сгенерировать'));
    await waitFor(() => { /* wait for generation */ });

    // Now optimize
    fireEvent.click(screen.getByText('Оптимизировать'));

    await waitFor(() => {
      expect(spendCreditsSpy).toHaveBeenCalledWith(1, 'Ad Optimization');
      expect(useCreditStore.getState().balance).toBe(8); // 10 - 1 (generate) - 1 (optimize)
    });
  });
});
