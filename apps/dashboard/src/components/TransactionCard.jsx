import React from 'react';

const TransactionCard = ({
  status, statusColor, title, id, time, category, tag, tagColor,
  userImage, username, price, image, stripeColor, isDispute, isCompleted, isPending
}) => {
  // Determine styles based on state
  let opacityClass = isCompleted ? 'opacity-80' : '';
  let grayscaleClass = isCompleted ? 'grayscale' : '';
  let borderClass = isDispute ? 'border border-error/20' : '';
  let pulseClass = (!isDispute && !isCompleted && !isPending) ? 'active-pulse' : '';
  
  return (
    <div className={`glass-card rounded-xl overflow-hidden ${pulseClass} hover:translate-y-[-4px] transition-all duration-300 relative group ${opacityClass} ${borderClass}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColor}`}></div>
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        <div className={`w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-lowest relative ${grayscaleClass}`}>
          <img alt={title} className="w-full h-full object-cover" src={image} />
          <div className={`absolute top-2 left-2 ${statusColor.bg} backdrop-blur-md ${statusColor.text} px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase`}>
            {status}
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-on-surface text-xl font-bold leading-tight group-hover:${statusColor.textHover} transition-colors`}>{title}</h3>
              <p className="text-outline text-xs font-mono mt-1 uppercase tracking-wider">{id}</p>
            </div>
            <span className="text-outline-variant text-[10px] font-bold">{time}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-surface-container-lowest text-on-surface-variant text-[10px] px-2 py-1 rounded-sm uppercase font-black tracking-tighter">
              {category}
            </span>
            <span className={`${tagColor.bg} ${tagColor.text} text-[10px] px-2 py-1 rounded-sm ${tagColor.border ? `border border-${tagColor.border}` : ''} font-bold`}>
              {tag}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${isDispute ? 'bg-error/20' : 'bg-surface-container-highest'} flex items-center justify-center overflow-hidden`}>
                {isDispute ? (
                  <span className="material-symbols-outlined text-[12px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                ) : (
                  <img alt="User" className="w-full h-full object-cover" src={userImage} />
                )}
              </div>
              <span className="text-on-secondary text-xs font-medium">{username}</span>
            </div>
            <div className="text-right">
              <p className={`${isDispute ? 'text-error' : (isPending ? 'text-secondary' : (isCompleted ? 'text-on-surface-variant' : 'text-primary'))} font-mono text-lg font-black leading-none`}>
                {price}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
