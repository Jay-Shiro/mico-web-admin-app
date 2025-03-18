"use client"
import Image from 'next/image'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

const data = [
    {
        name: 'Total',
        count: 2221,
        fill: 'white',
    },
  {
    name: 'Active',
    count: 1234,
    fill: '#001F3E',
  },
  {
    name: 'Inactive',
    count: 987,
    fill: '#FAE27C',
  },
];

const CountChart = () => {
  return (
    <div className='bg-white rounded-xl w-full h-full p-4'>
        {/*TITLE*/}
        <div className='flex justify-between items-center'>
            <h1 className='text-lg font-semibold'>Riders</h1>
            <Image src="/moreDark.png" alt="" width={20} height={20} />
        </div>
        {/*CHART*/}
        <div className='relative w-full h-[75%]'>
        <ResponsiveContainer >
        <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={32} data={data}>
          <RadialBar
            background
            dataKey="count"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <Image src="/active_inactive.png" alt="" width={120} height={120} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
        </div>
        {/*BOTTOM*/}
        <div className='flex justify-center gap-16'>
            <div className='flex flex-col gap-1'>
            <div className='w-5 h-5 bg-color1 rounded-full'></div>
            <h1 className='font-bold'>1,234</h1>
            <h2 className='text-xs text-gray-400'>Active (55%)</h2>
            </div>
            <div className='flex flex-col gap-1'>
            <div className='w-5 h-5 bg-color3 rounded-full'></div>
            <h1 className='font-bold'>987</h1>
            <h2 className='text-xs text-gray-400'>Inactive (45%)</h2>
            </div>
        </div>
    </div>
  )
}

export default CountChart