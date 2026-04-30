import { MouseEvent, useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  addFavorite,
  checkFavoriteStatus,
  removeFavorite,
} from "@/modules/favorites/api";

type FavoriteButtonVariant = "icon" | "inline";

interface FavoriteButtonProps {
  propertyId: string | number;
  initialIsFavorited?: boolean;
  variant?: FavoriteButtonVariant;
  className?: string;
  showLabel?: boolean;
  stopPropagation?: boolean;
  onChange?: (isFavorited: boolean) => void;
}

const iconBaseClassName =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/70 bg-white/95 text-slate-700 shadow-lg shadow-slate-950/10 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70";

const inlineBaseClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70";

const FavoriteButton = ({
  propertyId,
  initialIsFavorited = false,
  variant = "icon",
  className = "",
  showLabel = false,
  stopPropagation = true,
  onChange,
}: FavoriteButtonProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const numericPropertyId = Number(propertyId);
  const isBusy = isChecking || isSaving;

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited, propertyId]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !Number.isFinite(numericPropertyId)) {
      if (!isAuthenticated) {
        setIsFavorited(false);
      }
      return;
    }

    let cancelled = false;

    const fetchFavoriteStatus = async () => {
      try {
        setIsChecking(true);
        setError("");
        const status = await checkFavoriteStatus(numericPropertyId);

        if (!cancelled) {
          setIsFavorited(status.isFavorited);
        }
      } catch (fetchError) {
        if (!cancelled) {
          console.error("Failed to fetch favorite status:", fetchError);
          setError("Could not load favorite status.");
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    void fetchFavoriteStatus();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, numericPropertyId]);

  const handleToggle = async (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    if (isLoading || isSaving) {
      return;
    }

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!Number.isFinite(numericPropertyId) || numericPropertyId <= 0) {
      setError("This property could not be found.");
      return;
    }

    const nextValue = !isFavorited;
    setIsSaving(true);
    setError("");
    setIsFavorited(nextValue);

    try {
      const status = nextValue
        ? await addFavorite(numericPropertyId)
        : await removeFavorite(numericPropertyId);

      setIsFavorited(status.isFavorited);
      onChange?.(status.isFavorited);
    } catch (toggleError) {
      console.error("Failed to update favorite:", toggleError);
      setIsFavorited(!nextValue);
      setError(getApiErrorMessage(toggleError, "Could not update favorite."));
    } finally {
      setIsSaving(false);
    }
  };

  const buttonClassName = [
    variant === "inline" ? inlineBaseClassName : iconBaseClassName,
    isFavorited
      ? "border-red-200 bg-red-50 text-red-600"
      : "hover:bg-red-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const label = isFavorited ? "Saved" : "Save";

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isBusy}
        className={buttonClassName}
        aria-pressed={isFavorited}
        aria-label={
          isFavorited ? "Remove property from favorites" : "Add property to favorites"
        }
        title={error || label}
      >
        {isBusy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart
            className="h-5 w-5"
            fill={isFavorited ? "currentColor" : "none"}
          />
        )}
        {(showLabel || variant === "inline") && <span>{label}</span>}
      </button>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default FavoriteButton;
