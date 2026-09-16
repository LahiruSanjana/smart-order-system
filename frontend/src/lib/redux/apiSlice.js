import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("content-type", "application/json");
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Branch", "Product", "Order"],
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (userData) => ({
        url: "/users/signup",
        method: "POST",
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getUserProfile: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),
    updateUserProfile: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),
    changeUserPassword: builder.mutation({
      query: ({ userId, oldPassword, newPassword }) => ({
        url: `/users/${userId}/password`,
        method: "PUT",
        body: { oldPassword, newPassword },
      }),
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "User", id: userId },
      ],
    }),

    getBranches: builder.query({
      query: () => "/branches",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Branch", id })),
              { type: "Branch", id: "LIST" },
            ]
          : [{ type: "Branch", id: "LIST" }],
    }),
    getBranch: builder.query({
      query: (branchId) => `/branches/${branchId}`,
      providesTags: (_result, _error, branchId) => [
        { type: "Branch", id: branchId },
      ],
    }),
    createBranch: builder.mutation({
      query: (branchData) => ({
        url: "/branches",
        method: "POST",
        body: branchData,
      }),
      invalidatesTags: [{ type: "Branch", id: "LIST" }],
    }),
    updateBranch: builder.mutation({
      query: ({ branchId, ...branchData }) => ({
        url: `/branches/${branchId}`,
        method: "PUT",
        body: branchData,
      }),
      invalidatesTags: (_result, _error, { branchId }) => [
        { type: "Branch", id: branchId },
        { type: "Branch", id: "LIST" },
      ],
    }),
    deleteBranch: builder.mutation({
      query: (branchId) => ({ url: `/branches/${branchId}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Branch", id: "LIST" }],
    }),

    getProducts: builder.query({
      query: () => "/products",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product", id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
    getProduct: builder.query({
      query: (productId) => `/products/${productId}`,
      providesTags: (_result, _error, productId) => [
        { type: "Product", id: productId },
      ],
    }),
    createProduct: builder.mutation({
      query: (productData) => ({
        url: "/products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    updateProduct: builder.mutation({
      query: ({ productId, ...productData }) => ({
        url: `/products/${productId}`,
        method: "PUT",
        body: productData,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    getOrders: builder.query({
      query: () => "/orders",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Order", id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),
    getOrder: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (_result, _error, orderId) => [
        { type: "Order", id: orderId },
      ],
    }),
    getOrdersByCustomer: builder.query({
      query: (customerId) => `/orders/customer/${customerId}`,
      providesTags: [{ type: "Order", id: "CUSTOMER" }],
    }),
    getOrdersByBranch: builder.query({
      query: (branchId) => `/orders/branch/${branchId}`,
      providesTags: [{ type: "Order", id: "BRANCH" }],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    updateOrder: builder.mutation({
      query: ({ orderId, ...orderData }) => ({
        url: `/orders/${orderId}`,
        method: "PUT",
        body: orderData,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Order", id: orderId },
        { type: "Order", id: "LIST" },
      ],
    }),
    deleteOrder: builder.mutation({
      query: (orderId) => ({ url: `/orders/${orderId}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
  }),
});

export const {
  useSignUpMutation,
  useLoginMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserRoleMutation,
  useChangeUserPasswordMutation,
  useDeleteUserMutation,
  useGetBranchesQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrdersByCustomerQuery,
  useGetOrdersByBranchQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = apiSlice;
