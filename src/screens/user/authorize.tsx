import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {useMyMastodonInstance} from '../../api/hooks';
import {globalAuthUsers, globalAuth} from '../../api/user.state';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import {Type} from '../../components/Type';
import {oauthScopes} from '../../constants';
import {
  getClientApp,
  setActiveUserProfile,
  setClientApp,
  useAuth,
} from '../../storage/auth';
import {useThemeGetters} from '../../theme/utils';
import {RootStackParamList} from '../../types';
import {useMount} from '../../utils/hooks';
import {flex} from '../../utils/styles';

const authCodeParam = 'oauth/authorize/native?code=';

export const Authorize = ({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Authorize'>) => {
  const {host, scope, secondary} = route.params;
  const api = useMyMastodonInstance();
  const {getColor} = useThemeGetters();
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState(getClientApp(host)?.client_id);
  const [authCode, setAuthCode] = useState('');
  const auth = useAuth();

  useMount(() => {
    api.host = host;

    const fetchClientId = async () => {
      const app = await api.createApplication({name: 'Fediship'});
      if (!app) {
        console.warn('could not create app, TODO: this should show an error');
        return;
      }

      setClientApp(host, app);
      setClientId(app.client_id);
    };

    if (!clientId) {
      fetchClientId();
    } else {
      console.log(`reusing existing OAuth client app for ${host}`);
    }
  });

  useEffect(() => {
    if (!authCode || loading) {
      return;
    }

    const authenticate = async () => {
      const app = getClientApp(host);
      if (!app) {
        console.error(
          'No client app saved for token fetch, TODO: handle error',
        );
        return;
      }

      const {client_id, client_secret} = app;
      const token = await api.createToken({
        client_id,
        client_secret,
        code: authCode,
        scope: oauthScopes,
      });

      if (!token) {
        console.error('Login failed');
        return;
      }

      api.token = token.access_token;
      const user = await api.verifyAuth();
      if (!user) {
        console.error('Auth verification failed');
        return;
      }

      api.actorId = user.id;
      if (secondary) {
        const fqn = `${user.acct}@${host}`;
        globalAuthUsers[fqn].account.set(user);
        globalAuth.authLookup[fqn].set(token);
        navigation.navigate('User');
      } else {
        setActiveUserProfile(user);
        auth.setAuth({
          user: user.acct,
          host,
          oauthApp: app,
          tokenResult: token,
        });
      }
    };

    setLoading(true);
    authenticate();
  }, [navigation, authCode, loading, secondary, setLoading, auth, host, api]);

  const params = useMemo(() => {
    if (!clientId) {
      return [];
    }

    const queryParams = {
      client_id: clientId,
      response_type: 'code',
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      scope,
      force_login: true,
    };

    const paramKeys = Object.keys(queryParams) as Array<
      keyof typeof queryParams
    >;

    return paramKeys.reduce((acc, paramKey) => {
      return acc.concat(
        `${paramKey}=${encodeURIComponent(queryParams[paramKey])}`,
      );
    }, [] as string[]);
  }, [clientId, scope]);

  if (!clientId || authCode) {
    return (
      <View style={[flex, {backgroundColor: getColor('base')}]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={flex}>
      {!authCode && (
        <WebView
          incognito
          onLoadEnd={() => setLoading(false)}
          renderError={errorName => <Type>{errorName}</Type>}
          source={{
            uri: `https://${host}/oauth/authorize?${params.join('&')}`,
          }}
          onShouldStartLoadWithRequest={request => {
            if (request.url.includes(authCodeParam)) {
              const [, code] = request.url.split(authCodeParam);
              setAuthCode(code);
              return false;
            }

            // if (request.title.includes('Authorization required')) {
            //   navigation.goBack();
            //   return false;
            // }

            return request.url.startsWith(`https://${host}`);
          }}
        />
      )}
      {loading && (
        <View
          style={[
            flex,
            {
              backgroundColor: getColor('base'),
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
};
