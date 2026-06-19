import { useState } from 'react';
import { getRootFontSizePx } from '../../../utils';
import { QUALITATIVE_PALETTE, BLUE_PURPLE_07 } from '../../../constants/colors';

export interface KPICardData {
  title: string;
  value: number | string;
  change: string;
  isPositive: boolean;
  icon: string;
  bgColor: string;
  textColor: string;
}

export interface BookingActivity {
  day: string;
  count: number;
}

export interface ServiceShare {
  name: string;
  value: number;
  color: string;
}

export interface RecentBooking {
  customer: string;
  service: string;
  date: string;
  price: number;
  status: 'Completed' | 'Confirmed' | 'Pending' | 'Cancelled';
}

export const useDashboardOverview = () => {
  // KPI Metrics
  const [kpis] = useState<KPICardData[]>([
    {
      title: 'Total Revenue',
      value: 124500000000, 
      change: '+12%',
      isPositive: true,
      icon: 'material-symbols:payments-outline-rounded',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Bookings',
      value: '1,842',
      change: '+8%',
      isPositive: true,
      icon: 'material-symbols:event-available-outline-rounded',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      textColor: 'text-emerald-600 dark:text-emerald-455',
    },
    {
      title: 'Active Helpers',
      value: '145',
      change: '+4 new',
      isPositive: true,
      icon: 'material-symbols:group-outline-rounded',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Satisfaction',
      value: '98.4%',
      change: 'Excellent',
      isPositive: true,
      icon: 'material-symbols:rate-review-outline-rounded',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      textColor: 'text-violet-600 dark:text-violet-400',
    },
  ]);

  // Weekly Bookings Chart Data
  const [weeklyBookings] = useState<BookingActivity[]>([
    { day: 'Mon', count: 120 },
    { day: 'Tue', count: 200 },
    { day: 'Wed', count: 150 },
    { day: 'Thu', count: 80 },
    { day: 'Fri', count: 70 },
    { day: 'Sat', count: 110 },
    { day: 'Sun', count: 130 },
  ]);

  // Dynamically map QUALITATIVE_PALETTE colors to Service Categories (no hardcoding)
  const serviceCategories = ['Cleaning', 'Repair', 'Care', 'Others'];
  const serviceValues = [1048, 735, 580, 484];
  const [serviceShares] = useState<ServiceShare[]>(
    serviceCategories.map((name, index) => ({
      name,
      value: serviceValues[index],
      color: QUALITATIVE_PALETTE[index % QUALITATIVE_PALETTE.length]
    }))
  );

  // Recent Bookings List with numerical prices
  const [recentBookings] = useState<RecentBooking[]>([
    {
      customer: 'Nguyen Van A',
      service: 'Deep Home Cleaning',
      date: 'June 19, 2026',
      price: 500000,
      status: 'Completed',
    },
    {
      customer: 'Tran Thi B',
      service: 'AC Repair & Maintenance',
      date: 'June 19, 2026',
      price: 350000,
      status: 'Confirmed',
    },
    {
      customer: 'Le Van C',
      service: 'Elderly Care Hourly',
      date: 'June 18, 2026',
      price: 120000,
      status: 'Pending',
    },
  ]);

  // Total Services Count (calculated for display on the top-right of pie chart)
  const totalServiceCount = serviceShares.reduce((acc, curr) => acc + curr.value, 0);

  const rem = getRootFontSizePx();

  // Weekly Bookings Bar Option
  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: weeklyBookings.map(item => item.day),
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 0.8125 * rem }
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLine: { show: false },
        axisLabel: { color: '#64748b', fontSize: 0.8125 * rem } // Larger text (13px instead of 11px)
      }
    ],
    series: [
      {
        name: 'Bookings',
        type: 'bar',
        barWidth: '50%',
        data: weeklyBookings.map((item, index) => ({
          value: item.count,
          itemStyle: {
            color: BLUE_PURPLE_07[index % BLUE_PURPLE_07.length]
          }
        })),
        itemStyle: {
          borderRadius: [0.25 * rem, 0.25 * rem, 0, 0]
        }
      }
    ]
  };

  // Service Shares Pie Option
  const pieOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0',
      left: 'center',
      itemWidth: 0.5 * rem,
      itemHeight: 0.5 * rem,
      textStyle: { color: '#64748b', fontSize: 0.75 * rem },
      formatter: (name: string) => {
        const item = serviceShares.find(s => s.name === name);
        return item ? `${name} ( ${item.value} )` : name;
      }
    },
    series: [
      {
        name: 'Service Share',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0.375 * rem,
          borderColor: '#fff',
          borderWidth: 0.125 * rem
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 1 * rem, 
            fontWeight: 'bold',
            formatter: '{b}\n{c}'
          }
        },
        labelLine: {
          show: false
        },
        data: serviceShares.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color }
        }))
      }
    ]
  };

  return {
    kpis,
    recentBookings,
    totalServiceCount,
    barOption,
    pieOption,
  };
};
