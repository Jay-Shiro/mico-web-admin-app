"use client"
import Image from 'next/image'
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Mon',
    Online: 4000,
    Cash: 2400,
  },
  {
    name: 'Tue',
    Online: 3000,
    Cash: 1398,
  },
  {
    name: 'Wed',
    Online: 2000,
    Cash: 9800,
  },
  {
    name: 'Thu',
    Online: 2780,
    Cash: 3908,
  },
  {
    name: 'Fri',
    Online: 1890,
    Cash: 4800,
  },
  {
    name: 'Sat',
    Online: 2390,
    Cash: 3800,
  },
  {
    name: 'Sun',
    Online: 3490,
    Cash: 4300,
  },
];
const PaymentsChart = () => {
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
          <Tooltip  contentStyle={{borderRadius:"10px", borderColor:"Lightgray"}}/>
          <Legend align='left' verticalAlign='top' wrapperStyle={{paddingTop:"20px", paddingBottom:"40px"}}/>
          <Bar dataKey="Online" fill="#001F3E" legendType='circle' radius={[10,10,0,0]} />
          <Bar dataKey="Cash" fill="#FAE27C" legendType='circle' radius={[10,10,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PaymentsChart