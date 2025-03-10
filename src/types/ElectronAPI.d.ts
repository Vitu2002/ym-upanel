interface SaveUserEntity {
  id?: string;
  api_id: number;
  email: string;
  username: string;
  token: string;
}

interface AddQueueEntity {
  path: string;
  api_id: number;
  title: string;
  slug: string;
  cover: string | null;
}
