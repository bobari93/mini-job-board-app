"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useJobs } from "@/hooks/useJobs";

export default function AdminPage() {
  const {
    loading,
    error,
    stats,
    jobs,
    pagination,
    setCurrentPage,
    setItemsPerPage,
    searchJobs,
    deleteJob
  } = useJobs(true);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    searchJobs(query);
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(id);
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Job Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage and monitor your job listings</p>
            </div>
            <Link href="/admin/job/add">
              <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add New Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">All job listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Posted in last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Remote Jobs</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.remoteJobs}</div>
              <p className="text-xs text-muted-foreground">Remote opportunities</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Search & Filter</CardTitle>
            <CardDescription className="text-sm">Find specific jobs or filter by criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search jobs by title, company, or description..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto" onClick={() => handleSearch(searchQuery)}>
                <Filter className="w-4 h-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Job Listings</CardTitle>
            <CardDescription className="text-sm">Manage your current job postings</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading jobs...</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {jobs.map((job) => (
                <div key={job.id} className="border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow bg-card">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">{job.title}</h3>
                        <div className="flex flex-wrap gap-1">
                          {job.job_type.map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto sm:ml-4">
                      <Link href={`/admin/job/${job.id}`} className="flex-1 sm:flex-none">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-1 sm:flex-none w-full sm:w-auto"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {!loading && !error && jobs.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">Get started by adding your first job listing.</p>
                <Link href="/admin/job/add">
                  <Button className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Job
                  </Button>
                </Link>
              </div>
            )}

            {!loading && !error && jobs.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
