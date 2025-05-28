import UserCard from '../../../components/UserCard';
import CountChart from '../../../components/CountChart';
import PaymentsChart from '@/components/PaymentsChart';
import FinanceChart from '@/components/FinanceChart';
// import EventCalendar from '@/components/EventCalendar';
// import Announcements from '@/components/Announcements';
const AdminPage = () => {
  return (
    <div className='p-4 flex gap-4 flex-col md:flex-row'>
      {/* LEFT*/}
      <div className='w-full flex flex-col gap-8'>
      {/* USER CARDS*/}
      <div className='flex gap-4 justify-between flex-wrap'>
        <UserCard type='Deliveries' link='/list/deliveries'/>
        <UserCard type='Riders' link='/list/riders'/>
        <UserCard type='Cash Payments' link='/list/tracking'/>
        <UserCard type='Online Payments' link='/list/tracking'/>
      </div>
      {/*MIDDLE CHARTS*/}
      <div className='flex gap-4 flex-col lg:flex-row'>
        {/*ACTIVE AND INACTIVE RIDERS COUNT CHART*/}
        <div className='w-full lg:w-1/3 h-[450px]'>
        <CountChart/>
        </div>
        {/*ONLINE AND CASH PAYMENT BAR CHART*/}
        <div className='w-full lg:w-2/3 h-[450px]'>
        <PaymentsChart link='/list/tracking'/>
        </div>
      </div>
      {/*BOTTOM CHART*/}
      <div>
        <FinanceChart/>
      </div>
      </div>
    </div>
  )
}

export default AdminPage