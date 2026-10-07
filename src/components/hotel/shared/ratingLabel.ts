export const ratingLabel = (rating: number) =>
  rating >= 4.5 ? "Excellent" : rating >= 4 ? "Very Good" : rating >= 3.5 ? "Good" : "Pleasant";
