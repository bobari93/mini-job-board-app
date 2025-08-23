export type Job = {
  id: string;
  title: string;
  company_name: string;
  description: string;
  location: string;
  job_type: string[];
  user_id?: string;
  created_at: string;
  updated_at: string;
};
