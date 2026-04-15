import Head from "next/head";
import { useRouter } from "next/router";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { APP_ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import {
  getRecommendationSettings,
  resetRecommendationSettings,
  updateRecommendationSettings,
} from "@/modules/recommendation-settings/api";
import {
  RECOMMENDATION_WEIGHT_FIELDS,
  RECOMMENDATION_WEIGHT_TOTAL,
  RecommendationWeightKey,
  RecommendationWeights,
} from "@/modules/recommendation-settings/types";

type WeightFormState = Record<RecommendationWeightKey, string>;

const signalCopy: Record<RecommendationWeightKey, string> = {
  location: "Proximity to urban hubs and upcoming infrastructure projects.",
  price: "Alignment with current market valuation and historical entry points.",
  area: "Total land size or floor space square footage importance.",
  roi: "Projected annual yield and long-term capital appreciation potential.",
  highwayAccess: "Distance to major arterial roads and commercial transit links.",
};

const portfolioImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAuDjo3rZq9dr1XMkJPAGKPx9MjRvGAJkSgZ9Xom35QFyurNGDIXivUIS84b_rDPVaJorUPm9rJzoFTR3E45f0wtR7kArl3SFgT8cbVrjP0VYYhglZllbaMItpSJg_2fILN1zvHBZFagF-5x2plqtcKo7-PlSvg7AN-nIlHIwJ7SrJxVtN0gxl7YFmBkLOJU-ns33JYcdzyNTtDWaq1jEtJLpp7IQLPO4RUCU7_3r3fE197LHhJ6GROU21RZoywhF9WYb2-K54pdTE";

const toWholePercent = (value: number) =>
  Math.min(RECOMMENDATION_WEIGHT_TOTAL, Math.max(0, Math.round(value)));

const toFormState = (weights: RecommendationWeights): WeightFormState => ({
  location: String(toWholePercent(weights.location)),
  price: String(toWholePercent(weights.price)),
  area: String(toWholePercent(weights.area)),
  roi: String(toWholePercent(weights.roi)),
  highwayAccess: String(toWholePercent(weights.highwayAccess)),
});

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? toWholePercent(parsed) : Number.NaN;
};

const buildPayload = (formState: WeightFormState): RecommendationWeights => ({
  location: toNumber(formState.location),
  price: toNumber(formState.price),
  area: toNumber(formState.area),
  roi: toNumber(formState.roi),
  highwayAccess: toNumber(formState.highwayAccess),
});

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

const RecommendationSettingsPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [formState, setFormState] = useState<WeightFormState | null>(null);
  const [isDefault, setIsDefault] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      const redirect = encodeURIComponent(APP_ROUTES.settings);
      void router.replace(`${APP_ROUTES.login}?redirect=${redirect}`);
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadSettings = async () => {
      try {
        setIsFetching(true);
        setError("");
        const settings = await getRecommendationSettings();

        if (cancelled) {
          return;
        }

        setFormState(toFormState(settings.weights));
        setIsDefault(settings.isDefault);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load recommendation settings.",
        );
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const payload = useMemo(
    () => (formState ? buildPayload(formState) : null),
    [formState],
  );

  const total = useMemo(() => {
    if (!payload) {
      return 0;
    }

    return RECOMMENDATION_WEIGHT_FIELDS.reduce(
      (sum, field) =>
        sum + (Number.isFinite(payload[field.key]) ? payload[field.key] : 0),
      0,
    );
  }, [payload]);

  const isTotalValid = total === RECOMMENDATION_WEIGHT_TOTAL;

  const validationError = useMemo(() => {
    if (!payload) {
      return "";
    }

    for (const field of RECOMMENDATION_WEIGHT_FIELDS) {
      const value = payload[field.key];

      if (!Number.isFinite(value)) {
        return `${field.label} must be a number.`;
      }

      if (value < 0) {
        return `${field.label} cannot be negative.`;
      }
    }

    if (total <= 0) {
      return "At least one weight must be greater than 0.";
    }

    if (!isTotalValid) {
      return `Total must equal ${RECOMMENDATION_WEIGHT_TOTAL}. Current total is ${formatNumber(total)}.`;
    }

    return "";
  }, [isTotalValid, payload, total]);

  const handleWeightChange = (
    key: RecommendationWeightKey,
    value: string,
  ) => {
    const nextValue =
      value.trim() === "" || !Number.isFinite(Number(value))
        ? value
        : String(toNumber(value));

    setFormState((current) =>
      current
        ? {
            ...current,
            [key]: nextValue,
          }
        : current,
    );
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!payload || validationError) {
      setError(validationError || "Please enter valid recommendation weights.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setMessage("");
      const updated = await updateRecommendationSettings(payload);

      setFormState(toFormState(updated.weights));
      setIsDefault(false);
      setMessage("Recommendation settings saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save recommendation settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setIsResetting(true);
      setError("");
      setMessage("");
      const settings = await resetRecommendationSettings();

      setFormState(toFormState(settings.weights));
      setIsDefault(settings.isDefault);
      setMessage("Recommendation settings reset to defaults.");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset recommendation settings.",
      );
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading || (!user && !isLoading)) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16 text-center">
        <div>
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#004ac6] border-t-transparent" />
          <p className="font-auth-headline text-lg font-semibold text-[#131b2e]">
            Checking settings access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings | Blue Whale Investment</title>
      </Head>

      <main className="mx-auto max-w-5xl px-4 py-14 text-[#131b2e] sm:px-6 lg:px-8 lg:py-20">
        <header className="mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b4c5ff] bg-[#f0f4ff] px-4 py-2 font-auth-body text-xs font-bold text-[#004ac6]">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Personal Settings</span>
          </div>

          <h1 className="mb-6 max-w-4xl font-auth-headline text-4xl font-bold tracking-tight text-[#131b2e] md:text-5xl">
            Tune how your matches are ranked
          </h1>

          <p className="max-w-2xl font-auth-body text-lg leading-8 text-[#434655]">
            Assign a weight to each signal to personalize your investment feed.
            Your custom ranking keeps the strongest opportunities aligned with
            your criteria.
          </p>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#e3e7f6] bg-white shadow-[0_24px_70px_rgba(19,27,46,0.06)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e8ecf8] p-8 md:flex-row md:items-center">
            <div>
              <h2 className="font-auth-headline text-2xl font-semibold text-[#131b2e]">
                Ranking Weights
              </h2>
              <p className="mt-1 font-auth-body text-sm text-[#434655]">
                Signed in as {user?.fullName}
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 font-auth-body text-sm font-medium shadow-sm ${
                isTotalValid
                  ? "bg-[#645efb] text-white"
                  : "bg-[#ffdad6] text-[#93000a]"
              }`}
            >
              {isTotalValid ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <span>
                {formatNumber(total)} / {RECOMMENDATION_WEIGHT_TOTAL}
              </span>
              {isDefault && (
                <span className="rounded bg-white/20 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                  Default
                </span>
              )}
            </div>
          </div>

          {isFetching ? (
            <div className="p-8">
              <div className="rounded-lg bg-[#f5f7ff] px-4 py-4 font-auth-body text-sm text-[#5b6275]">
                Loading your recommendation settings...
              </div>
            </div>
          ) : (
            formState && (
              <form onSubmit={handleSubmit}>
                <div className="p-8">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {RECOMMENDATION_WEIGHT_FIELDS.map((field) => (
                      <label
                        key={field.key}
                        className="block rounded-lg border border-[#e3e7f6] bg-[#f8faff] p-6 transition duration-300 hover:shadow-lg hover:shadow-[#004ac6]/5"
                      >
                        <div className="mb-6 flex items-center justify-between">
                          <span className="font-auth-body text-xs font-bold uppercase tracking-wider text-[#434655]">
                            {field.label}
                          </span>
                          <span className="rounded bg-[#dbe1ff] px-2 py-1 font-auth-body text-xs font-bold text-[#00174b]">
                            {formatNumber(
                              Number.isFinite(payload?.[field.key])
                                ? payload?.[field.key] ?? 0
                                : 0,
                            )}
                            %
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={formState[field.key]}
                            onChange={(event) =>
                              handleWeightChange(field.key, event.target.value)
                            }
                            className="w-full border-none bg-transparent p-0 font-auth-headline text-4xl font-bold text-[#131b2e] outline-none focus:ring-0"
                          />
                          <span className="font-auth-headline text-2xl font-bold text-[#434655]">
                            %
                          </span>
                        </div>

                        <span className="mt-4 block font-auth-body text-xs italic leading-6 text-[#434655]">
                          {signalCopy[field.key]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {(validationError || error || message) && (
                  <div className="px-8 pb-6">
                    {(validationError || error) && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-auth-body text-sm text-red-700">
                        {error || validationError}
                      </div>
                    )}

                    {message && !validationError && !error && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-auth-body text-sm text-emerald-700">
                        {message}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-[#e8ecf8] bg-[#f2f3ff] p-8">
                  <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                      <button
                        type="submit"
                        disabled={
                          isSaving || isResetting || Boolean(validationError)
                        }
                        className="rounded-lg bg-[#2445db] px-8 py-3 font-auth-body text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#004ac6]/20 transition hover:bg-[#1736c4] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? "Saving..." : "Save Settings"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleResetToDefault()}
                        disabled={isSaving || isResetting}
                        className="rounded-lg border border-[#c3c6d7] bg-white px-8 py-3 font-auth-body text-xs font-bold uppercase tracking-widest text-[#131b2e] transition hover:bg-[#faf8ff] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isResetting ? "Resetting..." : "Back to Default"}
                      </button>
                    </div>

                    <p className="flex items-center gap-2 font-auth-body text-sm font-medium text-[#434655]">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>
                        Future recommendations use these weights automatically.
                      </span>
                    </p>
                  </div>
                </div>
              </form>
            )
          )}
        </section>

        <section className="mt-20 grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="mb-4 font-auth-headline text-2xl font-bold text-[#131b2e]">
              Precision Engineering for Portfolios
            </h3>
            <p className="mb-8 font-auth-body leading-7 text-[#434655]">
              Our ranking engine processes thousands of data points across
              Nepal&apos;s emerging markets. By refining these weights, you tell
              Blue Whale exactly which dimensions of growth matter most for your
              investment strategy.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-[#004ac6]" />
                <div>
                  <p className="font-auth-headline font-semibold text-[#131b2e]">
                    Data-Driven Sourcing
                  </p>
                  <p className="font-auth-body text-sm leading-6 text-[#434655]">
                    Validated through local government records and land registry
                    data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-[#004ac6]" />
                <div>
                  <p className="font-auth-headline font-semibold text-[#131b2e]">
                    Predictive Modeling
                  </p>
                  <p className="font-auth-body text-sm leading-6 text-[#434655]">
                    Uses 5-year historical trends to forecast future
                    appreciation rates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-lg shadow-2xl">
            <img
              src={portfolioImageUrl}
              alt="Investment analytics dashboard with blue charts and upward market lines"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#004ac6]/40 to-transparent" />
          </div>
        </section>
      </main>
    </>
  );
};

export default RecommendationSettingsPage;
