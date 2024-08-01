import React from 'react';

const LazyGroupsCategory = React.lazy(() =>
    import(/* webpackChunkName: "GroupsCategory" */ './groupsCategory')
);

const GroupsCategory = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Loading...</h1>}>
        <LazyGroupsCategory {...props} />
    </React.Suspense>
);

export default GroupsCategory