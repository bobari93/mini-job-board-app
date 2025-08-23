"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Job } from "@/types/job.types";

export interface JobFilters {
  search?: string;
  jobType?: string[];
  location?: string;
  company?: string;
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  remoteJobs: number;
  recentJobs: number;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface JobQueryParams {
  page: number;
  limit: number;
  search?: string;
  jobType?: string[];
  location?: string;
  company?: string;
}

export interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  stats: JobStats;
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  pagination: PaginationState;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  createJob: (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateJob: (id: string, jobData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Promise<Job | null>;
  filteredJobs: Job[];
  paginatedJobs: Job[];
  searchJobs: (query: string) => void;
  clearFilters: () => void;
  refreshJobs: () => Promise<void>;
}

export function useJobs(autoFetch: boolean = false): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobs = useCallback(async (queryParams?: JobQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      let query = supabase
        .from('job')
        .select('*', { count: 'exact' });

      const page = queryParams?.page || currentPage;
      const limit = queryParams?.limit || itemsPerPage;
      const offset = (page - 1) * limit;

      if (queryParams?.search) {
        query = query.or(`title.ilike.%${queryParams.search}%,company_name.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%,location.ilike.%${queryParams.search}%`);
      }

      if (queryParams?.company) {
        query = query.ilike('company_name', `%${queryParams.company}%`);
      }

      if (queryParams?.location) {
        query = query.ilike('location', `%${queryParams.location}%`);
      }

      if (queryParams?.jobType && queryParams.jobType.length > 0) {
        query = query.overlaps('job_type', queryParams.jobType);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      setJobs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (autoFetch) {
      fetchJobs({
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      });
    }
  }, [fetchJobs, currentPage, itemsPerPage, filters, autoFetch]);

  const createJob = useCallback(async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('job')
        .insert([{ ...jobData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      if (autoFetch) {
        await fetchJobs({
          page: 1,
          limit: itemsPerPage,
          ...filters
        });
      } else {
        setJobs(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [autoFetch, fetchJobs, itemsPerPage, filters]);

  const updateJob = useCallback(async (id: string, jobData: Partial<Job>) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error } = await supabase
        .from('job')
        .update({ ...jobData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (autoFetch) {
        await fetchJobs({
          page: currentPage,
          limit: itemsPerPage,
          ...filters
        });
      } else {
        setJobs(prev => prev.map(job =>
          job.id === id
            ? { ...job, ...data, updated_at: new Date().toISOString() }
            : job
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [autoFetch, fetchJobs, currentPage, itemsPerPage, filters]);

  const deleteJob = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { error } = await supabase
        .from('job')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (autoFetch) {
        await fetchJobs({
          page: currentPage,
          limit: itemsPerPage,
          ...filters
        });
      } else {
        setJobs(prev => prev.filter(job => job.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [autoFetch, fetchJobs, currentPage, itemsPerPage, filters]);

  const getJob = useCallback(async (id: string) => {
    const existingJob = jobs.find(job => job.id === id);
    if (existingJob) {
      return existingJob;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('job')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to fetch job");
    }
  }, [jobs]);

  const searchJobs = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refreshJobs = useCallback(async () => {
    await fetchJobs({
      page: currentPage,
      limit: itemsPerPage,
      ...filters
    });
  }, [fetchJobs, currentPage, itemsPerPage, filters]);

  const pagination = useMemo((): PaginationState => {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

    return {
      currentPage: validCurrentPage,
      itemsPerPage,
      totalItems: totalCount,
      totalPages,
    };
  }, [totalCount, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSetCurrentPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
  }, [pagination.totalPages]);

  const handleSetItemsPerPage = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const stats = useMemo((): JobStats => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => new Date(job.created_at) > thirtyDaysAgo).length,
      remoteJobs: jobs.filter(job => job.job_type.includes("Remote")).length,
      recentJobs: jobs.filter(job => new Date(job.created_at) > sevenDaysAgo).length,
    };
  }, [jobs]);

  return {
    jobs,
    loading,
    error,
    stats,
    filters,
    setFilters,
    pagination,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    createJob,
    updateJob,
    deleteJob,
    getJob,
    filteredJobs: jobs,
    paginatedJobs: jobs,
    searchJobs,
    clearFilters,
    refreshJobs,
  };
}
