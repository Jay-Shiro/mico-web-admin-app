const Announcements = () => {
  return (
    <div className='bg-white rounded-md p-4'>
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Announcements</h1>
            <span className="text-xs text-gray-400 cursor-pointer">View All</span>
        </div>
        <div className="flex flex-col gap-4 mt-4 rounded-md">
            <div className="bg-color1lite rounded-md p-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-medium">Lorem ipsum dolor sit</h2>
                    <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">2025-01-01</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Lorem ipsom dolor sit amet consectetur adipisicing elit. Volupatem, expedita. Rerum, quidem facilis?</p>
            </div>
            <div className="bg-color4 rounded-md p-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-medium">Lorem ipsum dolor sit</h2>
                    <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">2025-01-01</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Lorem ipsom dolor sit amet consectetur adipisicing elit. Volupatem, expedita. Rerum, quidem facilis?</p>
            </div>
            <div className="bg-color3lite rounded-md p-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-medium">Lorem ipsum dolor sit</h2>
                    <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">2025-01-01</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Lorem ipsom dolor sit amet consectetur adipisicing elit. Volupatem, expedita. Rerum, quidem facilis?</p>
            </div>
        </div>
    </div>
  )
}

export default Announcements