import React from 'react';

const LazyThankYou = React.lazy(() =>
  import(/* webpackChunkName: "ThankYou" */ './thankYou')
);

const ThankYou = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyThankYou {...props} />
  </React.Suspense>
);

export default ThankYou