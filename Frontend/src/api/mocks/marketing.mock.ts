import { subDays, format } from 'date-fns';

export const generateSalesTrends = (days: number = 7) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return {
      _id: format(date, 'yyyy-MM-dd'),
      revenue: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 50) + 10,
    };
  });
};

export const MOCK_TRAFFIC_DATA = [
  { name: 'Mon', organic: 4000, paid: 2400 },
  { name: 'Tue', organic: 3000, paid: 1398 },
  { name: 'Wed', organic: 2000, paid: 9800 },
  { name: 'Thu', organic: 2780, paid: 3908 },
  { name: 'Fri', organic: 1890, paid: 4800 },
  { name: 'Sat', organic: 2390, paid: 3800 },
  { name: 'Sun', organic: 3490, paid: 4300 },
];

export const MOCK_SOURCE_DATA = [
  { name: 'Direct', value: 400, color: '#6366f1' },
  { name: 'Social', value: 300, color: '#ec4899' },
  { name: 'Search', value: 300, color: '#10b981' },
  { name: 'Referral', value: 200, color: '#f59e0b' },
];

export const MOCK_CAMPAIGNS = [
  { name: 'Summer Sale 2024', status: 'Active', conversion: '4.2%', roas: '5.8x' },
  { name: 'New Arrival Blast', status: 'Scheduled', conversion: '-', roas: '-' },
  { name: 'Influencer Collab v2', status: 'Active', conversion: '3.1%', roas: '4.2x' },
];

export const MOCK_FEED_EVENTS = [
  { id: 1, type: 'coupon', message: 'Coupon WELCOME20 was used 12 times in last 10 mins.', time: '2 Minutes Ago', color: 'blue' },
  { id: 2, type: 'ads', message: 'High ROAS detected for Instagram Flash Sale campaign.', time: '15 Minutes Ago', color: 'emerald' },
  { id: 3, type: 'traffic', message: 'New traffic spike from Referral Sources (Hyderabad hub).', time: '1 Hour Ago', color: 'purple' },
];
