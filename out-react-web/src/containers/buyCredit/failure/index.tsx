import React from 'react';

const LazyBuyCreditFailure = React.lazy(() =>
    import(/* webpackChunkName: "Failure" */ './buyCreditFailure')
);

const BuyCreditFailure = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Please Wait... ! Don't Refresh the page.</h1>}>
        <LazyBuyCreditFailure {...props} />
    </React.Suspense>
);

export default BuyCreditFailure