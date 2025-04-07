"use client"
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define types for the delivery data and transformed chart data
interface Delivery {
  transaction_info: {
    payment_date: string;
  };
  price: number;
}

interface ChartData {
  name: string;
  Revenue: number;
  Profit: number;
}

const FinanceChart = () => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/deliveries', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch deliveries: ${response.statusText}`);
        }

        const result = await response.json();
        const transformedData = result.deliveries.reduce((acc: ChartData[], delivery: Delivery): ChartData[] => {
          const month = new Date(delivery.transaction_info.payment_date).toLocaleDateString('en-US', { month: 'short' });
        
          const existingMonth = acc.find((item) => item.name === month);
          if (existingMonth) {
            existingMonth.Revenue = (existingMonth.Revenue || 0) + delivery.price;
            existingMonth.Profit = (existingMonth.Profit || 0) + delivery.price * 0.2; // Assuming 20% profit margin
          } else {
            acc.push({
              name: month,
              Revenue: delivery.price,
              Profit: delivery.price * 0.2, // Assuming 20% profit margin
            });
          }
        
          return acc;
        }, []);

        setData(transformedData);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <div className='bg-white rounded-lg w-full h-full p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>Finance</h1>
        
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd'/>
          <XAxis dataKey="name" axisLine={false} tick={{fill:"#a3a8af"}} tickLine={false}/>
          <YAxis axisLine={false} tick={{fill:"#a3a8af"}} tickLine={false}/>
          <Tooltip contentStyle={{borderRadius:"10px", borderColor:"lightgray"}}/>
          <Legend align='center' verticalAlign='top' wrapperStyle={{paddingTop:"10px", paddingBottom:"30px"}}/>
          <Line type="monotone" dataKey="Revenue" stroke="#b4d9ff" strokeWidth={2} activeDot={{r:6}}/>
          <Line type="monotone" dataKey="Profit" stroke="#DBE64C" strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;