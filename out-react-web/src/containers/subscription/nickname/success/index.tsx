import React from 'react';

const LazyNicknameUpgradeSuccess = React.lazy(() =>
    import(/* webpackChunkName: "success" */ './upgradeSuccess')
);

const NicknameUpgrationSuccess = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Please Wait... ! Don't Refresh the page.</h1>}>
        <LazyNicknameUpgradeSuccess {...props} />
    </React.Suspense>
);

export default NicknameUpgrationSuccess