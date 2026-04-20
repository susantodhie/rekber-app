import apiClient from "../lib/apiClient";

// Create review
export const createReview = async (data) => {
  const response = await apiClient.post("/reviews", data);
  return response.data;
};

// Get reviews directed at a specific user (or me)
export const getMyReviews = async () => {
  const response = await apiClient.get(`/reviews/my-reviews`);
  return response.data;
};

// Get all reviews for admin
export const getAllReviews = async () => {
  const response = await apiClient.get(`/reviews/all`);
  return response.data;
};

// Get top public reviews for landing page
export const getTopPublicReviews = async () => {
  const response = await apiClient.get(`/reviews/public/top`);
  return response.data;
};
