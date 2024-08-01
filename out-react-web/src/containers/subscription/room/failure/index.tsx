import React from 'react';

const LazyFailure = React.lazy(() =>
    import(/* webpackChunkName: "failure" */ './failure')
);

const RoomSubscriptionFailure = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Please Wait... ! Don't Refresh the page.</h1>}>
        <LazyFailure {...props} />
    </React.Suspense>
);

export default RoomSubscriptionFailure