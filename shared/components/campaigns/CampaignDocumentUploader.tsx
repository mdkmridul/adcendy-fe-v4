'use client';

import { useRef, useState } from 'react';
import { FileUp, LoaderCircle, X } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useCampaignDocumentUpload } from '@/hooks/useCampaignDocuments';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  canUploadCampaignDocuments,
  validateUploadCandidate,
} from '@/shared/files/file-policy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

export function CampaignDocumentUploader({
  campaignId,
}: {
  campaignId: string | null | undefined;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const upload = useCampaignDocumentUpload(campaignId ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [availableAt, setAvailableAt] = useState('');
  const [progress, setProgress] = useState(0);

  if (!user || !canUploadCampaignDocuments(user.role)) {
    return null;
  }

  const clear = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setAvailableAt('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const startUpload = async () => {
    const validation = validateUploadCandidate(file);
    if (!validation.valid || !file || !campaignId) {
      toast({
        variant: 'destructive',
        title: 'File cannot be uploaded',
        description:
          validation.message ??
          'A campaign and supported file are required.',
      });
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setProgress(0);

    try {
      await upload.mutateAsync({
        input: {
          file,
          title: title || undefined,
          description: description || undefined,
          availableAt: availableAt
            ? new Date(availableAt).toISOString()
            : undefined,
        },
        options: {
          signal: controller.signal,
          onProgress: setProgress,
        },
      });
      toast({
        title: 'Document uploaded',
        description: 'The campaign document is now available under its configured release policy.',
      });
      clear();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast({
          title: 'Upload cancelled',
          description: 'No automatic retry was attempted.',
        });
        return;
      }
      const requestId = error instanceof ApiError ? error.requestId : undefined;
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: `${error instanceof Error ? error.message : 'Please try again.'}${
          requestId ? ` Request ID: ${requestId}` : ''
        }`,
      });
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Upload campaign document
        </CardTitle>
        <CardDescription>
          {user.role === 'REVIEWER'
            ? 'Reviewers may upload only to campaigns assigned to them.'
            : 'Administrators may upload to any existing campaign.'}
          {' '}Uploads are limited to one at a time in this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`campaign-document-${campaignId}`}>File</Label>
          <Input
            accept={ALLOWED_UPLOAD_EXTENSIONS.join(',')}
            disabled={upload.isPending}
            id={`campaign-document-${campaignId}`}
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              const validation = validateUploadCandidate(selected);
              if (selected && !validation.valid) {
                toast({
                  variant: 'destructive',
                  title: 'Unsupported file',
                  description: validation.message,
                });
                event.target.value = '';
                setFile(null);
                return;
              }
              setFile(selected);
              if (selected && !title) {
                setTitle(selected.name.replace(/\.[^.]+$/, ''));
              }
            }}
            ref={inputRef}
            type="file"
          />
          <p className="text-xs text-muted-foreground">
            PDF, Word, Excel, PowerPoint, CSV, text, Markdown, JPEG or PNG; maximum{' '}
            {Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MiB.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`campaign-document-title-${campaignId}`}>Display title</Label>
            <Input
              disabled={upload.isPending}
              id={`campaign-document-title-${campaignId}`}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`campaign-document-available-${campaignId}`}>Available at</Label>
            <Input
              disabled={upload.isPending}
              id={`campaign-document-available-${campaignId}`}
              onChange={(event) => setAvailableAt(event.target.value)}
              type="datetime-local"
              value={availableAt}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`campaign-document-description-${campaignId}`}>Description</Label>
          <Textarea
            disabled={upload.isPending}
            id={`campaign-document-description-${campaignId}`}
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            value={description}
          />
        </div>

        {upload.isPending ? (
          <div className="space-y-2" aria-live="polite">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              Uploading {progress}% — leaving this page may cancel the request.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!file || !campaignId || upload.isPending}
            onClick={() => void startUpload()}
            type="button"
          >
            {upload.isPending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="mr-2 h-4 w-4" />
            )}
            {upload.isPending ? 'Uploading...' : 'Upload document'}
          </Button>
          {upload.isPending ? (
            <Button
              onClick={() => abortControllerRef.current?.abort()}
              type="button"
              variant="outline"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
