import React from 'react';

const LazyNicknameUpgradeFailure = React.lazy(() =>
    import(/* webpackChunkName: "Failure" */ './upgradeFailure')
);

const NicknameUpgrationFailure = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Please Wait... ! Don't Refresh the page.</h1>}>
        <LazyNicknameUpgradeFailure {...props} />
    </React.Suspense>
);

export default NicknameUpgrationFailure