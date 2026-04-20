import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as reviewService from "../services/reviewService";

export const reviewKeys = {
  all: ["reviews"],
  myReviews: () => [...reviewKeys.all, "myReviews"],
  allReviewsAdmin: () => [...reviewKeys.all, "allReviewsAdmin"],
};

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => reviewService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: reviewKeys.myReviews(),
    queryFn: () => reviewService.getMyReviews(),
    select: (res) => res.data,
  });
}

export function useAllReviewsAdmin() {
  return useQuery({
    queryKey: reviewKeys.allReviewsAdmin(),
    queryFn: () => reviewService.getAllReviews(),
    select: (res) => res.data,
  });
}
