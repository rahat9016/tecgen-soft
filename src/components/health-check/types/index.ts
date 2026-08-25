export interface IHealthCheckPackage {
  id: string;
  title: string;
  description: string;
  image: string;
  status: boolean | "ACTIVE" | "INACTIVE";
  price: number;
  serviceList: string[];
  actions?: string;
}
