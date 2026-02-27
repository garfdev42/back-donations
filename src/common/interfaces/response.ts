export interface Response<T> {
  success: boolean;
  status: number;
  data: T;
}