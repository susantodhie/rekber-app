import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";

export const paymentKeys = {
  all: ["payment"],
  config: () => [...paymentKeys.all, "config"],
};

export function usePaymentConfig() {
  return useQuery({
    queryKey: paymentKeys.config(),
    queryFn: async () => {
      const { data } = await axios.get("/api/payment/config");
      return data;
    },
    select: (res) => res?.data || null,
  });
}
