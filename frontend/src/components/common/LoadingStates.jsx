// frontend/src/components/common/LoadingStates.jsx
import React from 'react';
import Loader from './Loader';

export const PageLoader = ({ message = "Loading content..." }) => (
  <div className="min-h-screen flex items-center justify-center dark-gradient-secondary">
    <Loader size="xl" message={message} />
  </div>
);

export const SectionLoader = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <Loader size="lg" message={message} />
  </div>
);

export const InlineLoader = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-4">
    <Loader size="sm" message={message} />
  </div>
);

export const StatsLoader = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="text-center">
          <div className="h-10 bg-gray-700 rounded-lg mb-2 mx-auto w-24"></div>
          <div className="h-4 bg-gray-600 rounded w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  PageLoader,
  SectionLoader,
  InlineLoader,
  StatsLoader
};