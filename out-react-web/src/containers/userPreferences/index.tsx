import React from 'react';

const LazyUserPreferences = React.lazy(() =>
    import(/* webpackChunkName: "UserPreferences" */ './userPreferences')
);

const UserPreferences = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1 className="page-lazy-loading">Loading...</h1>}>
        <LazyUserPreferences {...props} />
    </React.Suspense>
);

export default UserPreferences