import { MetricCard } from '../metric-card';

interface KPIMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalRestaurants: number;
  totalRiders: number;
  monthlyChanges: {
    revenue: { percentageChange: number };
    orders: { percentageChange: number };
    customers: { percentageChange: number };
    restaurants: { percentageChange: number };
    riders: { percentageChange: number };
  };
}

interface KPISectionProps {
  metrics: KPIMetrics;
}


export function KPISection({ metrics }: KPISectionProps) {
const RevenuePercentageChange = Math.round(metrics.monthlyChanges.revenue.percentageChange * 100) / 100;
const OrdersPercentageChange = Math.round(metrics.monthlyChanges.orders.percentageChange * 100) / 100;
const CustomersPercentageChange = Math.round(metrics.monthlyChanges.customers.percentageChange * 100) / 100;
const RestaurantsPercentageChange = Math.round(metrics.monthlyChanges.restaurants.percentageChange * 100) / 100;
const RidersPercentageChange = Math.round(metrics.monthlyChanges.riders.percentageChange * 100) / 100;

  return (
    <div className='grid grid-cols-5 rounded-[10px] overflow-hidden  border-[#EDEDEB] border'>
      <MetricCard title='Total Revenue' value={`$${metrics.totalRevenue}`} change={RevenuePercentageChange} />
      <MetricCard title='Total Orders' value={metrics.totalOrders.toString()} change={OrdersPercentageChange} />
      <MetricCard title='Total Customers' value={metrics.totalCustomers.toString()} change={CustomersPercentageChange} />
      <MetricCard title='Total restaurants' value={metrics.totalRestaurants.toString()} change={RestaurantsPercentageChange} />
      <MetricCard title='Total riders' value={metrics.totalRiders.toString()} change={RidersPercentageChange} />
    </div>
  );
}
