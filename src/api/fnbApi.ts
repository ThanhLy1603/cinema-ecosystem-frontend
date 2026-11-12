import type { AxiosResponse } from 'axios';
import axiosInstance from '@/api/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/common/api';
import type {
   FnbBestSellers,
   FnbCombo,
   FnbComboRequest,
   FnbComboSearchParams,
   FnbItem,
   FnbItemRequest,
   FnbItemSearchParams,
   FnbMenu,
} from '@/types/fnb/fnb';

export async function getPublicFnbMenu(): Promise<FnbMenu> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbMenu>> =
      await axiosInstance.get<ApiResponse<FnbMenu>>('/fnb/public');
   return axiosResponse.data.data;
}

export async function getFnbBestSellers(): Promise<FnbBestSellers> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbBestSellers>> =
      await axiosInstance.get<ApiResponse<FnbBestSellers>>('/fnb/public/best-sellers');
   return axiosResponse.data.data;
}

export async function searchAdminFnbItems(fnbItemSearchParams: FnbItemSearchParams): Promise<PageResponse<FnbItem>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<FnbItem>>> = await axiosInstance.get<
      ApiResponse<PageResponse<FnbItem>>
   >('/admin/fnb/items', { params: fnbItemSearchParams });
   return axiosResponse.data.data;
}

export async function listFnbItemOptions(): Promise<FnbItem[]> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbItem[]>> =
      await axiosInstance.get<ApiResponse<FnbItem[]>>('/admin/fnb/items/options');
   return axiosResponse.data.data;
}

export async function createFnbItem(fnbItemRequest: FnbItemRequest): Promise<FnbItem> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbItem>> = await axiosInstance.post<ApiResponse<FnbItem>>(
      '/admin/fnb/items',
      fnbItemRequest,
   );
   return axiosResponse.data.data;
}

export async function updateFnbItem(itemId: number, fnbItemRequest: FnbItemRequest): Promise<FnbItem> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbItem>> = await axiosInstance.put<ApiResponse<FnbItem>>(
      `/admin/fnb/items/${itemId}`,
      fnbItemRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteFnbItem(itemId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/fnb/items/${itemId}`);
}

export async function restoreFnbItem(itemId: number): Promise<FnbItem> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbItem>> = await axiosInstance.post<ApiResponse<FnbItem>>(
      `/admin/fnb/items/${itemId}/restore`,
   );
   return axiosResponse.data.data;
}

export async function searchAdminFnbCombos(
   fnbComboSearchParams: FnbComboSearchParams,
): Promise<PageResponse<FnbCombo>> {
   const axiosResponse: AxiosResponse<ApiResponse<PageResponse<FnbCombo>>> = await axiosInstance.get<
      ApiResponse<PageResponse<FnbCombo>>
   >('/admin/fnb/combos', { params: fnbComboSearchParams });
   return axiosResponse.data.data;
}

export async function createFnbCombo(fnbComboRequest: FnbComboRequest): Promise<FnbCombo> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbCombo>> = await axiosInstance.post<ApiResponse<FnbCombo>>(
      '/admin/fnb/combos',
      fnbComboRequest,
   );
   return axiosResponse.data.data;
}

export async function updateFnbCombo(comboId: number, fnbComboRequest: FnbComboRequest): Promise<FnbCombo> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbCombo>> = await axiosInstance.put<ApiResponse<FnbCombo>>(
      `/admin/fnb/combos/${comboId}`,
      fnbComboRequest,
   );
   return axiosResponse.data.data;
}

export async function deleteFnbCombo(comboId: number): Promise<void> {
   await axiosInstance.delete<ApiResponse<null>>(`/admin/fnb/combos/${comboId}`);
}

export async function restoreFnbCombo(comboId: number): Promise<FnbCombo> {
   const axiosResponse: AxiosResponse<ApiResponse<FnbCombo>> = await axiosInstance.post<ApiResponse<FnbCombo>>(
      `/admin/fnb/combos/${comboId}/restore`,
   );
   return axiosResponse.data.data;
}
