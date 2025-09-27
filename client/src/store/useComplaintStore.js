import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useComplaintStore = create((set, get) => ({
  isFetchingComplains: false,
  allcomplaints: [],
  usercomplaints: [],
  isFetchingUserComplaints: false,
  isVoting: false,
  isCommenting: false,

  getAllComplaints: async () => {
    set({ isFetchingComplains: true });
    try {
      const res = await axiosInstance.get("/complaints/getallcomplaints");
      // Access res.data.data since controller sends {data: allComplaints}
      const complaints = res.data.data || [];
      set({ allcomplaints: complaints, isFetchingComplains: false });
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to fetch complaints");
      set({ allcomplaints: [], isFetchingComplains: false });
    }
  },

  getUserComplaints: async () => {
    set({ isFetchingUserComplaints: true });
    try {
      const res = await axiosInstance.get("/complaints/user");
      const complaints = res.data.complaints || [];
      set({ usercomplaints: complaints, isFetchingUserComplaints: false });
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      toast.error("Failed to fetch your complaints");
      set({ usercomplaints: [], isFetchingUserComplaints: false });
    }
  },

  upvoteComplaint: async (complaintId) => {
    set({ isVoting: true });
    try {
      const res = await axiosInstance.patch(
        `/complaints/${complaintId}/upvote`
      );
      if (res.data.success) {
        // Update local state
        const { allcomplaints, usercomplaints } = get();
        const updatedComplaints = allcomplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                upvote: res.data.data.upvote,
                downvote: res.data.data.downvote,
              }
            : complaint
        );
        // Also update user complaints if they exist
        const updatedUserComplaints = usercomplaints.map((complaint) =>
          complaint._id === complaintId || complaint.id === complaintId
            ? {
                ...complaint,
                upvote: res.data.data.upvote,
                downvote: res.data.data.downvote,
              }
            : complaint
        );
        set({
          allcomplaints: updatedComplaints,
          usercomplaints: updatedUserComplaints,
        });
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
        `/complaints/${complaintId}/downvote`
      );
      if (res.data.success) {
        // Update local state
        const { allcomplaints, usercomplaints } = get();
        const updatedComplaints = allcomplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                upvote: res.data.data.upvote,
                downvote: res.data.data.downvote,
              }
            : complaint
        );
        // Also update user complaints if they exist
        const updatedUserComplaints = usercomplaints.map((complaint) =>
          complaint._id === complaintId || complaint.id === complaintId
            ? {
                ...complaint,
                upvote: res.data.data.upvote,
                downvote: res.data.data.downvote,
              }
            : complaint
        );
        set({
          allcomplaints: updatedComplaints,
          usercomplaints: updatedUserComplaints,
        });
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
        `/complaints/${complaintId}/comment`,
        {
          text: commentText,
        }
      );
      if (res.data.success) {
        // Update local state - add the new comment to the complaint
        const { allcomplaints, usercomplaints } = get();
        const updatedComplaints = allcomplaints.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                comments: [
                  ...(complaint.comments || []),
                  res.data.data.comment,
                ],
                commentsCount: (complaint.commentsCount || 0) + 1,
              }
            : complaint
        );
        // Also update user complaints if they exist
        const updatedUserComplaints = usercomplaints.map((complaint) =>
          complaint._id === complaintId || complaint.id === complaintId
            ? {
                ...complaint,
                comments: [
                  ...(complaint.comments || []),
                  res.data.data.comment,
                ],
                commentsCount: (complaint.commentsCount || 0) + 1,
              }
            : complaint
        );
        set({
          allcomplaints: updatedComplaints,
          usercomplaints: updatedUserComplaints,
        });
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
