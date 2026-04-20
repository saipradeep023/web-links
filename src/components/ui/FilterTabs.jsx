/**
 * FilterTabs — horizontal tab bar with count badges.
 *
 * Props:
 *   tabs       – [{ id, label, count }]
 *   activeTab  – currently selected tab id
 *   onChange   – (tabId) => void
 */
export default function FilterTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
      {tabs.map(({ id, label, count }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            id={`filter-tab-${id.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              isActive
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50'
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
