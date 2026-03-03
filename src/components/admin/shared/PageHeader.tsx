import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function PageHeader({ title, description, actions, breadcrumbs = [] }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-gray-700">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}