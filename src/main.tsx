import React, {useMemo, useState} from 'react';
import {Thread} from './thread';
import {Timeline} from './timeline';
import {Route, RouteParams} from './types';

export const routes = Object.freeze({
  timeline: Timeline,
  thread: Thread,
});

export const App = () => {
  const [params, setParams] = useState<RouteParams>({});
  const [route, setRoute] = useState<Route>('timeline');

  const navigation = useMemo(
    () => ({
      getParams: () => params,
      navigate: (name: Route, forwardParams?: RouteParams) => {
        if (forwardParams) {
          setParams(forwardParams);
        } else {
          setParams({});
        }
        setRoute(name);
      },
    }),
    [params, setRoute, setParams],
  );

  const Component = routes[route];

  return <Component {...{navigation}} />;
};
