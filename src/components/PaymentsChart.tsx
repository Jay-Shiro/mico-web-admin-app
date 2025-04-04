"use client"
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PaymentsChart = () => {
  const [data, setData] = useState([]);

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
        const transformedData = result.deliveries.reduce((acc: Array<{ name: string; [key: string]: number | string }>, delivery: { transaction_info: { payment_date: string }; transactiontype: string; price: number }) => {
          const day = new Date(delivery.transaction_info.payment_date).toLocaleDateString('en-US', { weekday: 'short' });
          const transactionType = delivery.transactiontype.toLowerCase();

          const existingDay = acc.find((item) => item.name === day);
          if (existingDay) {
            existingDay[transactionType] = (Number(existingDay[transactionType]) || 0) + delivery.price;
          } else {
            acc.push({
              name: day,
              [transactionType]: delivery.price,
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
        <h1 className='text-lg font-semibold'>Payments</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          width={500}
          height={300}
          data={data}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd'/>
          <XAxis dataKey="name" axisLine={false} tick={{fill:"#a3a8af"}} tickLine={false}/>
          <YAxis axisLine={false} tick={{fill:"#a3a8af"}} tickLine={false}/>
          <Tooltip contentStyle={{borderRadius:"10px", borderColor:"Lightgray"}}/>
          <Legend align='left' verticalAlign='top' wrapperStyle={{paddingTop:"20px", paddingBottom:"40px"}}/>
          <Bar dataKey="online" fill="#001F3E" legendType='circle' radius={[10,10,0,0]} />
          <Bar dataKey="cash" fill="#FAE27C" legendType='circle' radius={[10,10,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentsChart;

