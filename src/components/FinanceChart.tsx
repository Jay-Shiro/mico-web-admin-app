"use client"
import Image from 'next/image'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Jan',
    Profit: 4000,
    Revenue: 2400,
    amt: 2400,
  },
  {
    name: 'Feb',
    Profit: 3000,
    Revenue: 1398,
    amt: 2210,
  },
  {
    name: 'Mar',
    Profit: 2000,
    Revenue: 9800,
    amt: 2290,
  },
  {
    name: 'Apr',
    Profit: 2780,
    Revenue: 3908,
    amt: 2000,
  },
  {
    name: 'May',
    Profit: 1890,
    Revenue: 4800,
    amt: 2181,
  },
  {
    name: 'Jun',
    Profit: 2390,
    Revenue: 3800,
    amt: 2500,
  },
  {
    name: 'Jul',
    Profit: 3490,
    Revenue: 4300,
    amt: 2100,
  },
  {
    name: 'Aug',
    Profit: 3490,
    Revenue: 4300,
    amt: 2100,
  },
  {
    name: 'Sep',
    Profit: 3490,
    Revenue: 4300,
    amt: 2100,
  },
  {
    name: 'Oct',
    Profit: 3490,
    Revenue: 4300,
    amt: 2100,
  },
  {
    name: 'Nov',
    Profit: 3490,
    Revenue: 4300,
    amt: 2100,
  },
  {
    name: 'Dec',
    Profit: 3490,
    Revenue: 4300,
    amt: 2100,
  },
  
];
const FinanceChart = () => {
  return (
    <div className='bg-white rounded-lg w-full h-full p-4'>
        <div className='flex justify-between items-center'>
            <h1 className='text-lg font-semibold'>Finance</h1>
            <Image src="/moreDark.png" alt="" width={20} height={20} />
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
  )
}

export default FinanceChart