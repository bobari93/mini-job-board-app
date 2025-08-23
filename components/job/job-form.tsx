"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Check, Loader2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";

interface AddJobFormProps {
  className?: string;
  mode?: 'create' | 'edit';
  jobId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
  "Hybrid",
  "On-site"
];

export function JobForm({ className, mode = 'create', jobId, onSuccess, onCancel }: AddJobFormProps) {
  const { createJob, updateJob, getJob } = useJobs(false);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');

  const handleAddJobType = (jobType: string) => {
    if (!selectedJobTypes.includes(jobType)) {
      setSelectedJobTypes([...selectedJobTypes, jobType]);
    }
    setShowJobTypeDropdown(false);
  };

  const handleRemoveJobType = (jobTypeToRemove: string) => {
    setSelectedJobTypes(selectedJobTypes.filter(type => type !== jobTypeToRemove));
  };

  useEffect(() => {
    const loadJob = async () => {
      if (mode === 'edit' && jobId) {
        try {
          setLoading(true);
          setError(null);

          const jobData = await getJob(jobId);
          if (!jobData) {
            setError("Job not found");
            return;
          }

          setTitle(jobData.title);
          setCompanyName(jobData.company_name);
          setDescription(jobData.description);
          setLocation(jobData.location);
          setSelectedJobTypes(jobData.job_type);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load job");
        } finally {
          setLoading(false);
        }
      }
    };

    loadJob();
  }, [mode, jobId, getJob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Job title is required");
      setIsLoading(false);
      return;
    }

    if (!companyName.trim()) {
      setError("Company name is required");
      setIsLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("Job description is required");
      setIsLoading(false);
      return;
    }

    if (!location.trim()) {
      setError("Location is required");
      setIsLoading(false);
      return;
    }

    if (selectedJobTypes.length === 0) {
      setError("At least one job type must be selected");
      setIsLoading(false);
      return;
    }

    try {
      const jobData = {
        title: title.trim(),
        company_name: companyName.trim(),
        description: description.trim(),
        location: location.trim(),
        job_type: selectedJobTypes,
      };

      if (mode === 'edit' && jobId) {
        await updateJob(jobId, jobData);
      } else {
        await createJob(jobData);

        // Reset form only for create mode
        setTitle("");
        setCompanyName("");
        setDescription("");
        setLocation("");
        setSelectedJobTypes([]);
      }

      setError(null);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : `Failed to ${mode} job listing`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading job details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && mode === 'edit') {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={onCancel} variant="outline">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === 'edit' ? 'Edit Job' : 'Add New Job'}
          </CardTitle>
          <CardDescription>
            {mode === 'edit' ? 'Update the job listing details' : 'Create a new job listing for your board'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Job Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Senior Frontend Developer"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Company Name */}
              <div className="grid gap-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="e.g., TechCorp Inc."
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., San Francisco, CA"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Job Types */}
              <div className="grid gap-2">
                <Label>Job Types *</Label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowJobTypeDropdown(!showJobTypeDropdown)}
                  >
                    <span className="text-muted-foreground">
                      {selectedJobTypes.length === 0
                        ? "Select job types..."
                        : `${selectedJobTypes.length} selected`
                      }
                    </span>
                    <Plus className="h-4 w-4" />
                  </Button>

                  {showJobTypeDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-2">
                      {JOB_TYPE_OPTIONS.map((jobType) => (
                        <button
                          key={jobType}
                          type="button"
                          className={cn(
                            "w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent flex items-center gap-2",
                            selectedJobTypes.includes(jobType) && "bg-accent"
                          )}
                          onClick={() => handleAddJobType(jobType)}
                        >
                          {selectedJobTypes.includes(jobType) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                          {jobType}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Job Types */}
                {selectedJobTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedJobTypes.map((jobType) => (
                      <Badge key={jobType} variant="secondary" className="flex items-center gap-1">
                        {jobType}
                        <button
                          type="button"
                          onClick={() => handleRemoveJobType(jobType)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Job Description *</Label>
                <textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading
                    ? (mode === 'edit' ? "Updating job..." : "Creating job...")
                    : (mode === 'edit' ? "Update Job" : "Create Job")
                  }
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
