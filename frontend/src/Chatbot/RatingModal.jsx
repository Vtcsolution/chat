import { useState } from "react";
import { Star, X, User, MessageCircle, Clock, Heart, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

// Color scheme matching your app
const colors = {
  primary: "#2B1B3F",      // Deep purple
  secondary: "#C9A24D",    // Antique gold
  accent: "#9B7EDE",       // Light purple
  bgLight: "#3A2B4F",      // Lighter purple
  textLight: "#E8D9B0",    // Light gold text
  success: "#10B981",      // Green
  warning: "#F59E0B",      // Yellow
  danger: "#EF4444",       // Red
  background: "#F5F3EB",   // Soft ivory
};

const RatingModal = ({ 
  isOpen, 
  onClose, 
  psychic, 
  sessionId,
  onRatingSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length < 5) {
      toast.error("Please write a comment (minimum 5 characters)");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/ratings`,
        {
          psychicId: psychic._id,
          rating,
          comment: comment.trim(),
          sessionId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Thank you for your feedback!");
        onRatingSubmitted(response.data.data);
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setHoverRating(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg" style={{ backgroundColor: colors.background }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg" style={{ color: colors.primary }}>
            <Star className="h-5 w-5" style={{ color: colors.secondary }} />
            Rate Your Session
          </DialogTitle>
          <DialogDescription style={{ color: colors.primary + '80' }}>
            How was your experience with {psychic?.name}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Psychic Info */}
          <div 
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}10 100%)`,
              border: `1px solid ${colors.secondary}20`
            }}
          >
            <div 
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
              }}
            >
              {psychic?.name?.[0]?.toUpperCase() || "P"}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: colors.primary }}>{psychic?.name}</h3>
              <p className="text-sm flex items-center gap-1" style={{ color: colors.primary + '70' }}>
                <User className="h-3 w-3" />
                Human Psychic
              </p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: colors.primary }}>
              How would you rate your experience?
            </label>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-current text-amber-400"
                        : "text-gray-300"
                    }`}
                    style={{ 
                      color: star <= (hoverRating || rating) ? colors.secondary : undefined 
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="text-center">
              <span className="text-sm" style={{ color: colors.primary + '70' }}>
                {rating === 0 ? "Select a rating" : 
                 rating === 1 ? "Poor" :
                 rating === 2 ? "Fair" :
                 rating === 3 ? "Good" :
                 rating === 4 ? "Very Good" : "Excellent"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: colors.primary }}>
              Share your experience (optional but appreciated)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about the session? How can it be improved?"
              className="min-h-[100px] resize-none"
              maxLength={500}
              style={{ borderColor: colors.primary + '20' }}
            />
            <div className="flex justify-between text-xs" style={{ color: colors.primary + '60' }}>
              <span>Minimum 5 characters</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Tips for Good Feedback */}
          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: colors.primary + '08',
              border: `1px solid ${colors.primary}20`
            }}
          >
            <h4 className="text-sm font-medium mb-1" style={{ color: colors.primary }}>
              Tips for helpful feedback:
            </h4>
            <ul className="text-xs space-y-1" style={{ color: colors.primary + '80' }}>
              <li className="flex items-start gap-1">
                <MessageCircle className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: colors.secondary }} />
                Was the psychic insightful and helpful?
              </li>
              <li className="flex items-start gap-1">
                <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: colors.secondary }} />
                Was the response time reasonable?
              </li>
              <li className="flex items-start gap-1">
                <Heart className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: colors.secondary }} />
                Would you recommend this psychic to others?
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={submitting}
              style={{ 
                borderColor: colors.primary + '20',
                color: colors.primary
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 text-white"
              disabled={submitting || rating === 0 || comment.trim().length < 5}
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary}CC 0%, ${colors.secondary}CC 100%)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
              }}
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Submit Rating
                </>
              )}
            </Button>
          </div>

          {/* Quick Rating Options */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRating(5);
                setComment("Great session! Very insightful and helpful.");
              }}
              style={{ 
                borderColor: colors.secondary + '30',
                color: colors.primary
              }}
            >
              <ThumbsUp className="h-3 w-3 mr-1" style={{ color: colors.secondary }} />
              Great
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRating(4);
                setComment("Good session, helpful advice.");
              }}
              style={{ 
                borderColor: colors.secondary + '30',
                color: colors.primary
              }}
            >
              <Star className="h-3 w-3 mr-1" style={{ color: colors.secondary }} />
              Good
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-center" style={{ color: colors.primary + '50' }}>
            Your feedback helps us improve our service. Ratings are anonymous and visible to other users.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;