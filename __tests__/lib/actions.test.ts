import { createPoll } from '@/lib/actions';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Mock the dependencies
jest.mock('@/lib/supabase/server');
jest.mock('next/cache');
jest.mock('next/navigation');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('createPoll', () => {
  let mockSupabase: any;
  let mockFormData: FormData;
  let mockPollsInsert: jest.Mock;
  let mockOptionsInsert: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock functions that will be reused
    mockPollsInsert = jest.fn();
    mockOptionsInsert = jest.fn();

    // Mock Supabase client with proper method chaining
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockImplementation((table) => {
        if (table === 'polls') {
          return {
            insert: mockPollsInsert.mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn(),
              }),
            }),
          };
        } else if (table === 'poll_options') {
          return {
            insert: mockOptionsInsert,
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);

    // Mock redirect to prevent actual redirects in tests
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    // Mock FormData
    mockFormData = new FormData();
    mockFormData.set('question', 'What is your favorite color?');
    mockFormData.set('option1', 'Red');
    mockFormData.set('option2', 'Blue');
    mockFormData.set('option3', 'Green');
  });

  it('should create a poll successfully with valid data', async () => {
    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock successful poll creation
    const mockPoll = { id: 'poll-123', question: 'What is your favorite color?' };
    const mockPollsChain = mockSupabase.from('polls').insert().select().single;
    mockPollsChain.mockResolvedValue({
      data: mockPoll,
      error: null,
    });

    // Mock successful options creation
    mockOptionsInsert.mockResolvedValue({
      error: null,
    });

    // Call the function and expect redirect error
    await expect(createPoll(mockFormData)).rejects.toThrow('NEXT_REDIRECT');

    // Verify authentication was checked
    expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);

    // Verify poll was created
    expect(mockSupabase.from).toHaveBeenCalledWith('polls');
    expect(mockPollsInsert).toHaveBeenCalledWith({
      question: 'What is your favorite color?',
      author_id: 'user-123',
    });

    // Verify options were created
    expect(mockSupabase.from).toHaveBeenCalledWith('poll_options');
    expect(mockOptionsInsert).toHaveBeenCalledWith([
      { poll_id: 'poll-123', text: 'Red', order_index: 0 },
      { poll_id: 'poll-123', text: 'Blue', order_index: 1 },
      { poll_id: 'poll-123', text: 'Green', order_index: 2 },
    ]);

    // Verify revalidation and redirect
    expect(mockRevalidatePath).toHaveBeenCalledWith('/polls');
    expect(mockRedirect).toHaveBeenCalledWith('/polls/poll-123');
  });

  it('should throw error when question is empty', async () => {
    mockFormData.set('question', '');

    await expect(createPoll(mockFormData)).rejects.toThrow('Question is required');
  });

  it('should throw error when less than 2 options are provided', async () => {
    mockFormData.delete('option2');
    mockFormData.delete('option3');

    await expect(createPoll(mockFormData)).rejects.toThrow('At least 2 options are required');
  });

  it('should throw error when user is not authenticated', async () => {
    // Mock failed authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    await expect(createPoll(mockFormData)).rejects.toThrow('You must be logged in to create a poll');
  });

  it('should throw error when poll creation fails', async () => {
    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock failed poll creation
    const mockPollsChain = mockSupabase.from('polls').insert().select().single;
    mockPollsChain.mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    });

    await expect(createPoll(mockFormData)).rejects.toThrow('Failed to create poll');
  });

  it('should throw error when poll options creation fails', async () => {
    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock successful poll creation
    const mockPoll = { id: 'poll-123', question: 'What is your favorite color?' };
    const mockPollsChain = mockSupabase.from('polls').insert().select().single;
    mockPollsChain.mockResolvedValue({
      data: mockPoll,
      error: null,
    });

    // Mock failed options creation
    mockOptionsInsert.mockResolvedValue({
      error: new Error('Options creation failed'),
    });

    await expect(createPoll(mockFormData)).rejects.toThrow('Failed to create poll options');
  });

  it('should filter out empty options', async () => {
    mockFormData.set('option3', ''); // Empty option

    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock successful poll creation
    const mockPoll = { id: 'poll-123', question: 'What is your favorite color?' };
    const mockPollsChain = mockSupabase.from('polls').insert().select().single;
    mockPollsChain.mockResolvedValue({
      data: mockPoll,
      error: null,
    });

    // Mock successful options creation
    mockOptionsInsert.mockResolvedValue({
      error: null,
    });

    await expect(createPoll(mockFormData)).rejects.toThrow('NEXT_REDIRECT');

    // Verify only 2 options were created (empty option filtered out)
    expect(mockOptionsInsert).toHaveBeenCalledWith([
      { poll_id: 'poll-123', text: 'Red', order_index: 0 },
      { poll_id: 'poll-123', text: 'Blue', order_index: 1 },
    ]);
  });

  it('should trim whitespace from question and options', async () => {
    mockFormData.set('question', '  What is your favorite color?  ');
    mockFormData.set('option1', '  Red  ');
    mockFormData.set('option2', '  Blue  ');

    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock successful poll creation
    const mockPoll = { id: 'poll-123', question: 'What is your favorite color?' };
    const mockPollsChain = mockSupabase.from('polls').insert().select().single;
    mockPollsChain.mockResolvedValue({
      data: mockPoll,
      error: null,
    });

    // Mock successful options creation
    mockOptionsInsert.mockResolvedValue({
      error: null,
    });

    await expect(createPoll(mockFormData)).rejects.toThrow('NEXT_REDIRECT');

    // Verify trimmed values were used
    expect(mockPollsInsert).toHaveBeenCalledWith({
      question: 'What is your favorite color?',
      author_id: 'user-123',
    });

    expect(mockOptionsInsert).toHaveBeenCalledWith([
      { poll_id: 'poll-123', text: 'Red', order_index: 0 },
      { poll_id: 'poll-123', text: 'Blue', order_index: 1 },
    ]);
  });
});
