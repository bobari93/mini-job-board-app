"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme-switcher";

import { Search, MapPin, Building, Briefcase } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Job } from "@/types/job.types";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
  const locations = ["Remote", "New York", "San Francisco", "London", "Toronto", "Other"];

  useEffect(() => {
    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchQuery, selectedJobType, selectedLocation]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      let query = supabase
        .from('job')
        .select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      if (selectedJobType) {
        query = query.overlaps('job_type', [selectedJobType]);
      }

      if (selectedLocation) {
        query = query.ilike('location', `%${selectedLocation}%`);
      }

      const offset = (currentPage - 1) * itemsPerPage;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (error) throw error;
      setJobs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedJobType("");
    setSelectedLocation("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="w-full flex justify-center border-b border-border h-14 sm:h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-4 sm:px-5 text-sm">
          <div className="flex gap-3 sm:gap-5 items-center font-semibold">
            <Link href="/" className="text-lg sm:text-xl font-bold text-foreground">
              Mini Job Board
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Find Your Next Opportunity
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Discover amazing job opportunities from top companies
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Job Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Button onClick={handleSearch} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Search className="w-4 h-4" />
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
            Clear Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading jobs...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchJobs} variant="outline" className="w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button onClick={clearFilters} variant="outline" className="w-full sm:w-auto">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/job/${job.id}`}>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 break-words">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {job.job_type.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-3 mb-4 text-sm sm:text-base">
                    {job.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Posted {formatDate(job.created_at)}
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/job/${job.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} job{totalCount !== 1 ? 's' : ''}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-2 py-1 border border-input bg-background rounded text-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-4 sm:mt-6">
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                    const page = Math.max(1, Math.min(
                      Math.ceil(totalCount / itemsPerPage) - 4,
                      currentPage - 2
                    )) + i;

                    if (page > Math.ceil(totalCount / itemsPerPage)) return null;

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.ceil(totalCount / itemsPerPage))}
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                  className="text-xs sm:text-sm"
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
