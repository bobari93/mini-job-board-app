"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Job } from "@/types/job.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Loader2,
  ExternalLink,
  Mail
} from "lucide-react";
import Link from "next/link";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error } = await supabase
          .from('job')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const jobDate = new Date(dateString);
    const diffInMs = now.getTime() - jobDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading job details...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !job) {
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Job not found</h3>
            <p className="text-muted-foreground mb-4">
              {error || "The job you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </main>
    );
  }

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Job Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-lg text-muted-foreground mb-3">
                      <Building className="w-5 h-5" />
                      <span>{job.company_name}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.job_type.map((type) => (
                      <Badge key={type} variant="secondary" className="text-sm">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {formatTimeAgo(job.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(job.created_at)}</span>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Job Description</h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{job.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{job.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{job.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Job Type</span>
                      <span className="text-sm font-medium">{job.job_type.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">{job.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Posted</span>
                      <span className="text-sm font-medium">{formatDate(job.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Apply Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Apply for this position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Mail className="w-4 h-4 mr-2" />
                    Apply via Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Company Website
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Click &quot;Apply via Email&quot; to send your application directly to the company.
                  </p>
                </CardContent>
              </Card>

              {/* Share Job */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share this job</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
