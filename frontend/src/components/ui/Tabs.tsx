import React, { useState } from 'react';
import { tokens } from '../../styles/tokens';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export default function Tabs({
  tabs,
  defaultTab,
  onChange,
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    fontFamily: tokens.typography.fontFamily,
  };

  const tabListStyles: React.CSSProperties = {
    display: 'flex',
    borderBottom: `1px solid ${tokens.colors.border}`,
    gap: tokens.spacing[1],
  };

  const getTabStyles = (tabId: string, disabled?: boolean): React.CSSProperties => {
    const isActive = tabId === activeTab;
    return {
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      fontSize: tokens.typography.fontSizeSm,
      fontWeight: isActive ? tokens.typography.fontWeightSemibold : tokens.typography.fontWeightNormal,
      color: disabled
        ? tokens.colors.textTertiary
        : isActive
          ? tokens.colors.accent
          : tokens.colors.textSecondary,
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${isActive ? tokens.colors.accent : 'transparent'}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '-1px',
    };
  };

  const panelStyles: React.CSSProperties = {
    padding: tokens.spacing[4] + ' 0',
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className} style={containerStyles}>
      <div style={tabListStyles} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-disabled={tab.disabled}
            style={getTabStyles(tab.id, tab.disabled)}
            onClick={() => handleTabClick(tab.id, tab.disabled)}
            onMouseEnter={(e) => {
              if (!tab.disabled && tab.id !== activeTab) {
                e.currentTarget.style.color = tokens.colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (!tab.disabled && tab.id !== activeTab) {
                e.currentTarget.style.color = tokens.colors.textSecondary;
              }
            }}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={panelStyles} role="tabpanel">
        {activeTabContent}
      </div>
    </div>
  );
}
