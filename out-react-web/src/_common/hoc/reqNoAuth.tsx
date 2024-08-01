import React from "react";
import { Redirect } from "react-router";
import { URLS } from "../../_config";
import Layout from "../layout/Layout";
import { useAuthStatus } from "../hooks/auth/authHook";

const requireNoAuth = (Component: React.ComponentType) => {
  function NoAuthHoc(props: any) {
    const isAuth = useAuthStatus();

    return isAuth ? (
      <Redirect to={URLS.USER.DASHBOARD} />
    ) : (
      <Layout>
        <Component {...props} />
      </Layout>
    );
  }

  return NoAuthHoc;
};
export default requireNoAuth;
