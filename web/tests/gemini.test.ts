/**
 * Tests for Gemini client JSON parsing, fallback handling, and caching.
 */

// Mock fetch globally
global.fetch = jest.fn();

// Reset modules and cache between tests
beforeEach(() => {
  jest.resetModules();
  (global.fetch as jest.Mock).mockReset();
  process.env.GEMINI_API_KEY = 'test-key-123';
});

afterEach(() => {
  delete process.env.GEMINI_API_KEY;
});

function makeFetchResponse(text: string, ok = true) {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    text: () => Promise.resolve('Server error'),
    json: () => Promise.resolve({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
  });
}

describe('analyzeFood', () => {
  it('returns parsed FoodAnalysis on valid Gemini response', async () => {
    const mockAnalysis = {
      name: 'Grilled Chicken',
      macros: { calories: 350, protein: 40, carbs: 5, fat: 15, fiber: 0 },
      healthScore: 9,
      tip: 'Great protein source!',
      servingSize: '200g',
      ingredients: ['chicken', 'olive oil', 'herbs'],
    };

    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchResponse(JSON.stringify(mockAnalysis)));

    const { analyzeFood } = await import('../lib/gemini');
    const result = await analyzeFood('grilled chicken breast');

    expect(result.name).toBe('Grilled Chicken');
    expect(result.macros.calories).toBe(350);
    expect(result.healthScore).toBe(9);
  });

  it('returns fallback when Gemini returns malformed JSON', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchResponse('this is not json'));

    const { analyzeFood } = await import('../lib/gemini');
    const result = await analyzeFood('some random food xyz123');

    // Should return fallback, not throw
    expect(result).toBeDefined();
    expect(result.macros).toBeDefined();
    expect(typeof result.healthScore).toBe('number');
  });

  it('returns fallback when candidates array is empty', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      }),
    );

    const { analyzeFood } = await import('../lib/gemini');
    const result = await analyzeFood('empty response food');

    expect(result).toBeDefined();
    expect(result.name).toBe('Unknown Food');
  });

  it('throws when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const { analyzeFood } = await import('../lib/gemini');
    await expect(analyzeFood('some food')).rejects.toThrow('GEMINI_API_KEY is not configured');
  });

  it('throws on non-OK API response', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limit exceeded'),
      }),
    );

    const { analyzeFood } = await import('../lib/gemini');
    await expect(analyzeFood('rate limited food')).rejects.toThrow('Gemini API error 429');
  });
});

describe('suggestMeal', () => {
  it('returns a MealSuggestion on valid response', async () => {
    const mockSuggestion = {
      name: 'Quinoa Bowl',
      description: 'Nutritious grain bowl with veggies.',
      estimatedMacros: { calories: 400, protein: 15, carbs: 65, fat: 10, fiber: 8 },
      reason: 'Matches your remaining carb goals.',
      prepTime: '20 mins',
    };

    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchResponse(JSON.stringify(mockSuggestion)));

    const { suggestMeal } = await import('../lib/gemini');
    const consumed = { calories: 1200, protein: 40, carbs: 150, fat: 35, fiber: 12 };
    const goals = { calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25 };

    const result = await suggestMeal(consumed, goals, 'afternoon');
    expect(result.name).toBe('Quinoa Bowl');
    expect(result.estimatedMacros.calories).toBe(400);
  });

  it('returns fallback suggestion when Gemini fails', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchResponse('bad json!!!'));

    const { suggestMeal } = await import('../lib/gemini');
    const consumed = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const goals = { calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25 };

    const result = await suggestMeal(consumed, goals, 'morning');
    expect(result).toBeDefined();
    expect(result.name).toBeTruthy();
    expect(result.estimatedMacros).toBeDefined();
  });
});
