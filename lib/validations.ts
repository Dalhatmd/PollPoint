export const loginSchema = {
  email: {
    required: true,
  },
  password: {
    required: true,
    minLength: 6,
  },
} as const;

export const newPollSchema = {
  question: { required: true, minLength: 4 },
  options: { required: true, min: 2 },
} as const;



