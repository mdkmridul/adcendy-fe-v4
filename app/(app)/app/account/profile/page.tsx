"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CircleUserRound, Coins } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryKeys } from "@/shared/api/queryKeys";
import { userProfileRepository } from "@/shared/api/repositories";

export default function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => userProfileRepository.getMe(),
    refetchOnWindowFocus: true,
  });

  const profile = profileQuery.data;
  const subscription = profile?.billing.subscription;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <CircleUserRound className="h-5 w-5" /> Account profile
        </div>
        <h1 className="font-space-grotesk text-3xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">
          Your account details, credit balance, and subscription status.
        </p>
      </div>

      {profileQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Could not load your profile. Please refresh and try again.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Authenticated profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Name
              </p>
              <p className="font-medium">
                {profile?.displayName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p className="font-medium">{profile?.email ?? "Loading…"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Role
              </p>
              <Badge variant="secondary">{profile?.role ?? "…"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> One-time credits
            </CardTitle>
            <CardDescription>The currently active billing model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-semibold">
              {profile?.billing.creditBalance ?? "—"}
            </div>
            <p className="text-sm text-muted-foreground">
              Available strategy generation credits
            </p>
            <Button asChild>
              <Link href="/app/checkout">Buy credits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Subscription
            </span>
            <Badge variant={subscription?.status === "ACTIVE" ? "default" : "secondary"}>
              {subscription?.status === "NOT_AVAILABLE"
                ? "Coming soon"
                : (subscription?.status ?? "Loading…")}
            </Badge>
          </CardTitle>
          <CardDescription>Recurring Razorpay billing status</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.available ? (
            <p className="text-sm text-muted-foreground">
              Current status: {subscription.status.replaceAll("_", " ")}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Subscriptions are not available yet. Your account continues to
              use one-time credits, and no recurring payment can be started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
