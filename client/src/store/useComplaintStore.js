import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useComplaintStore = create((set, get) => ({
  isFetchingComplains: false,
  allcomplaints: [],
  isVoting: false,
  isCommenting: false,

  getAllComplaints: async () => {
    set({ isFetchingComplains: true });
    try {
      const res = await axiosInstance.get("/complaint/getallcomplaints");
      // Access res.data.data since controller sends {data: allComplaints}
      const complaints = res.data.data || [];
      set({ allcomplaints: complaints, isFetchingComplains: false });
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to fetch complaints");
      set({ allcomplaints: [], isFetchingComplains: false });
    }
  },

  upvoteComplaint: async (complaintId) => {
    set({ isVoting: true });
    try {
      const res = await axiosInstance.patch(`/complaint/${complaintId}/upvote`);
      if (res.data.success) {
        // Update local state
        const { allcomplaints } = get();
        const updatedComplaints = allcomplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                upvote: res.data.data.upvote,
                downvote: res.data.data.downvote,
              }
            : complaint
        );
        set({ allcomplaints: updatedComplaints });
        toast.success("Upvoted!");
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      toast.error("Failed to upvote");
    } finally {
      set({ isVoting: false });
    }
  },

  downvoteComplaint: async (complaintId) => {
    set({ isVoting: true });
    try {
      const res = await axiosInstance.patch(
        `/complaint/${complaintId}/downvote`
      );
      if (res.data.success) {
        // Update local state
        const { allcomplaints } = get();
        const updatedComplaints = allcomplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                upvote: res.data.data.upvote,
                downvote: res.data.data.downvote,
              }
            : complaint
        );
        set({ allcomplaints: updatedComplaints });
        toast.success("Downvoted!");
      }
    } catch (error) {
      console.error("Error downvoting:", error);
      toast.error("Failed to downvote");
    } finally {
      set({ isVoting: false });
    }
  },

  addComment: async (complaintId, commentText) => {
    set({ isCommenting: true });
    try {
      const res = await axiosInstance.post(
        `/complaint/${complaintId}/comment`,
        {
          text: commentText,
        }
      );
      if (res.data.success) {
        // Update local state - add the new comment to the complaint
        const { allcomplaints } = get();
        const updatedComplaints = allcomplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                comments: [
                  ...(complaint.comments || []),
                  res.data.data.comment,
                ],
              }
            : complaint
        );
        set({ allcomplaints: updatedComplaints });
        toast.success("Comment added!");
        return true; // Success indicator for UI
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return false;
    } finally {
      set({ isCommenting: false });
    }
  },
}));
