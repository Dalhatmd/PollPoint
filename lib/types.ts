export type PollOption = {
  id: string;
  text: string;
  order_index: number;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  author_id?: string;
  created_at?: string;
  updated_at?: string;
  options: PollOption[];
};

export type NewPollInput = {
  question: string;
  options: { text: string }[];
};

export type VoteInput = {
  pollId: string;
  optionId: string;
};



