import { Home, Search, MessageSquare, Settings, FileText, BarChart2 } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col justify-between">
      <div>
        <div className="px-6 py-4 font-bold text-xl text-blue-600">JobFinder</div>
        <nav className="mt-6 space-y-2 px-4">
          <SidebarItem icon={<Home size={18} />} label="Home" />
          <SidebarItem icon={<Search size={18} />} label="Search Job" active />
          <SidebarItem icon={<MessageSquare size={18} />} label="Chat" badge="8" />
          <SidebarItem icon={<FileText size={18} />} label="Projects" />
          <SidebarItem icon={<BarChart2 size={18} />} label="Payments" />
          <SidebarItem icon={<Settings size={18} />} label="Settings" />
        </nav>
      </div>
      <div className="p-4 flex items-center space-x-3">
        <img src="/avatar.png" className="w-10 h-10 rounded-full" />
        <div>
          <p className="text-sm font-medium">Eren</p>
          <p className="text-xs text-gray-500">Designer</p>
        </div>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}

function SidebarItem({ icon, label, active = false, badge }: SidebarItemProps) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer 
      ${active ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5">{icon}</div>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </div>
  );
}
