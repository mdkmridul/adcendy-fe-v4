'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Building2, Package, Users, ChevronDown, ChevronUp, Pencil, AlertCircle } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WizardStepper } from '@/shared/components/wizard/WizardStepper';
import { WizardHeader } from '@/shared/components/wizard/WizardHeader';
import { wizardRepository } from '@/shared/api/repositories';
import { campaignsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { ApiError } from '@/shared/api/errors';

const STEPS = [
  { key: 'STEP_1', label: 'Context' },
  { key: 'STEP_2', label: 'Offer' },
  { key: 'STEP_3', label: 'Audience' },
  { key: 'PREVIEW', label: 'Preview' },
];

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const queryClient = useQueryClient();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Confirmation states - always start unchecked for explicit user action
  const [confirmBusinessInfo, setConfirmBusinessInfo] = useState(false);
  const [confirmOffer, setConfirmOffer] = useState(false);
  const [confirmAudience, setConfirmAudience] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  
  // Collapsible section states
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);
  const [isOfferOpen, setIsOfferOpen] = useState(true);
  const [isAudienceOpen, setIsAudienceOpen] = useState(true);
  
  // Conflict handling
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  const { data: campaign } = useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId),
    queryFn: () => campaignsRepository.getCampaign(campaignId),
  });

  const { data: allSteps } = useQuery({
    queryKey: queryKeys.wizard.steps(campaignId),
    queryFn: () => wizardRepository.listSteps(campaignId),
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: queryKeys.wizard.preview(campaignId),
    queryFn: () => wizardRepository.getPreview(campaignId),
  });

  const { data: wizardState } = useQuery({
    queryKey: queryKeys.wizard.state(campaignId),
    queryFn: () => wizardRepository.getWizardState(campaignId),
  });

  const commitMutation = useMutation({
    mutationFn: () => {
      const version = wizardState?.draft?.version;
      const payload = {
        version,
        confirmBusinessInfo,
        confirmOffer,
        confirmAudience,
        readyToGenerate,
      };
      console.log('[Preview] Commit mutation payload:', payload);
      return wizardRepository.commitAndGenerate(campaignId, payload);
    },
    onSuccess: async () => {
      // Invalidate and wait for campaign to refresh status
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(campaignId) });
      // Wait a bit for the backend to update the campaign status
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(`/app/campaigns/${campaignId}/overview`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        // Version conflict - reset all confirmations and show dialog
        setConfirmBusinessInfo(false);
        setConfirmOffer(false);
        setConfirmAudience(false);
        setReadyToGenerate(false);
        setShowConflictDialog(true);
      }
    },
  });

  const handleRefreshConflict = async () => {
    setShowConflictDialog(false);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.wizard.preview(campaignId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(campaignId) }),
    ]);
  };

  const handleGenerateStrategy = () => {
    // All confirmations are guaranteed to be true due to button disabled state
    commitMutation.mutate();
  };

  // Check if all confirmations are complete
  const allConfirmed = confirmBusinessInfo && confirmOffer && confirmAudience && readyToGenerate;

  useEffect(() => {
    if (allSteps) {
      setCompletedSteps(allSteps.map((s: { stepKey: string }) => s.stepKey));
    }
  }, [allSteps]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign Updated Elsewhere</AlertDialogTitle>
            <AlertDialogDescription>
              This campaign was updated in another session. Your confirmations have been reset.
              Click "Refresh" to load the latest version and review again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRefreshConflict}>
              Refresh & Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WizardHeader
        campaignName={campaign?.name || 'Campaign'}
        campaignId={campaignId}
        saveStatus="idle"
      />
      <WizardStepper
        steps={STEPS}
        currentStepKey="PREVIEW"
        completedSteps={completedSteps}
        onStepClick={(key) => {
          if (completedSteps.includes(key)) {
            const routeMap: Record<string, string> = {
              STEP_1: 'step-1',
              STEP_2: 'step-2',
              STEP_3: 'step-3',
              PREVIEW: 'preview',
            };
            router.push(`/app/campaigns/${campaignId}/setup/${routeMap[key]}`);
          }
        }}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Campaign Preview</h2>
            <p className="text-muted-foreground">Review your setup before generating a strategy.</p>
          </div>

          {previewLoading ? (
            <Card className="p-8 animate-pulse h-40" />
          ) : preview ? (
            <>
              {/* Business Context Section */}
              <Collapsible open={isBusinessOpen} onOpenChange={setIsBusinessOpen}>
                <Card className="border border-border bg-card">
                  <CollapsibleTrigger className="w-full px-6 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Business Context</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {isBusinessOpen && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/app/campaigns/${campaignId}/setup/step-1`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </div>
                      )}
                      {isBusinessOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Campaign Title</p>
                          <p className="font-medium text-foreground">{preview.steps.step1?.title || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Market Location</p>
                          <p className="font-medium text-foreground">{preview.steps.step1?.marketLocation || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Business Type</p>
                          <p className="font-medium text-foreground">{preview.steps.step1?.businessType || 'N/A'}</p>
                        </div>
                        {preview.steps.step1?.websiteUrl && (
                          <div>
                            <p className="text-muted-foreground">Website</p>
                            <p className="font-medium text-foreground truncate">{String(preview.steps.step1.websiteUrl)}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-border">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <Checkbox
                            id="confirm-business"
                            checked={confirmBusinessInfo}
                            onCheckedChange={(checked) => setConfirmBusinessInfo(checked === true)}
                            className="mt-0.5 flex-shrink-0 h-6 w-6 bg-background border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor="confirm-business"
                            className="text-sm font-semibold text-foreground cursor-pointer select-none flex-1"
                          >
                            I confirm the business and market information is accurate
                          </label>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Offer Section */}
              {preview.steps.step2 && (
                <Collapsible open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                  <Card className="border border-border bg-card">
                    <CollapsibleTrigger className="w-full px-6 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Your Offer</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOfferOpen && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/app/campaigns/${campaignId}/setup/step-2`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </div>
                        )}
                        {isOfferOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-4">
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Summary</p>
                            <p className="font-medium text-foreground">{preview.steps.step2.offerSummary}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Price Range</p>
                            <p className="font-medium text-foreground">{preview.steps.step2.priceRange}</p>
                          </div>
                          {preview.steps.step2.differentiators && preview.steps.step2.differentiators.length > 0 && (
                            <div>
                              <p className="text-muted-foreground mb-2">Differentiators</p>
                              <ul className="list-disc list-inside space-y-1">
                                {preview.steps.step2.differentiators.map((diff, i) => (
                                  <li key={i} className="text-foreground">{diff}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {preview.steps.step2.constraints && preview.steps.step2.constraints.length > 0 && (
                            <div>
                              <p className="text-muted-foreground mb-2">Constraints</p>
                              <ul className="list-disc list-inside space-y-1">
                                {preview.steps.step2.constraints.map((constraint, i) => (
                                  <li key={i} className="text-foreground">{constraint}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-border">
                          <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                            <Checkbox
                              id="confirm-offer"
                              checked={confirmOffer}
                              onCheckedChange={(checked) => setConfirmOffer(checked === true)}
                              className="mt-0.5 flex-shrink-0 h-6 w-6 bg-background border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="confirm-offer"
                              className="text-sm font-semibold text-foreground cursor-pointer select-none flex-1"
                            >
                              I confirm the offer details are correct
                            </label>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {/* Audience Section */}
              {preview.steps.step3 && (
                <Collapsible open={isAudienceOpen} onOpenChange={setIsAudienceOpen}>
                  <Card className="border border-border bg-card">
                    <CollapsibleTrigger className="w-full px-6 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Target Audience</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAudienceOpen && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/app/campaigns/${campaignId}/setup/step-3`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </div>
                        )}
                        {isAudienceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-4">
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Target Persona</p>
                            <p className="font-medium text-foreground">{preview.steps.step3.targetPersona}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Language</p>
                            <p className="font-medium text-foreground">{preview.steps.step3.language}</p>
                          </div>
                          {preview.steps.step3.painPoints && preview.steps.step3.painPoints.length > 0 && (
                            <div>
                              <p className="text-muted-foreground mb-2">Pain Points</p>
                              <ul className="list-disc list-inside space-y-1">
                                {preview.steps.step3.painPoints.map((point, i) => (
                                  <li key={i} className="text-foreground">{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Desired Outcome</p>
                            <p className="font-medium text-foreground">{preview.steps.step3.desiredOutcome}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-border">
                          <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                            <Checkbox
                              id="confirm-audience"
                              checked={confirmAudience}
                              onCheckedChange={(checked) => setConfirmAudience(checked === true)}
                              className="mt-0.5 flex-shrink-0 h-6 w-6 bg-background border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="confirm-audience"
                              className="text-sm font-semibold text-foreground cursor-pointer select-none flex-1"
                            >
                              I confirm the audience definition is accurate
                            </label>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {/* Final Confirmation */}
              <Card className="p-6 border-2 border-primary bg-primary/10">
                <div className="flex items-start gap-4">
                  <Checkbox
                    id="ready-to-generate"
                    checked={readyToGenerate}
                    onCheckedChange={(checked) => setReadyToGenerate(checked === true)}
                    className="mt-1 flex-shrink-0 h-6 w-6 bg-background border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="space-y-1.5 flex-1">
                    <label
                      htmlFor="ready-to-generate"
                      className="text-base font-bold text-foreground cursor-pointer select-none block"
                    >
                      I have reviewed all details and am ready to generate the strategy
                    </label>
                    <p className="text-sm text-muted-foreground font-medium">
                      This action will start analysis and cannot be undone
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/app/campaigns/${campaignId}/setup/step-3`)}
                >
                  Back
                </Button>
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={!allConfirmed || commitMutation.isPending}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {commitMutation.isPending ? 'Generating...' : 'Generate Strategy'}
                </Button>
              </div>

              {/* Validation Helper */}
              {!allConfirmed && (
                <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    <p className="font-medium">Please confirm all sections before generating:</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {!confirmBusinessInfo && <li>Business & Market Information</li>}
                      {!confirmOffer && <li>Offer Details</li>}
                      {!confirmAudience && <li>Audience Definition</li>}
                      {!readyToGenerate && <li>Ready to Generate Confirmation</li>}
                    </ul>
                  </div>
                </div>
              )}

              {commitMutation.isError && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded">
                  <p className="text-sm text-destructive">Failed to generate strategy. Please try again.</p>
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No preview data available. Please complete all wizard steps.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
