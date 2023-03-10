import { makeRedirectUri, revokeAsync, startAsync } from 'expo-auth-session';
import React, { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { generateRandom } from 'expo-auth-session/build/PKCE';
import { api } from "../services/api";

import { Alert } from "react-native";

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

interface User {
  id: number;
  display_name: string;
  email: string;
  profile_image_url: string;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
    state: string;
    error: string;
  };
  type: string;
}

interface AuthContextData {
  user: User;
  isLoggingOut: boolean;
  isLoggingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderData {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

const twitchEndpoints = {
  authorization: "https://id.twitch.tv/oauth2/authorize",
  revocation: "https://id.twitch.tv/oauth2/revoke",
};

function AuthProvider({ children }: AuthProviderData) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState({} as User);
  const [userToken, setUserToken] = useState("");

  async function signIn() {
    try {
      setIsLoggingIn(true);

      const REDIRECT = makeRedirectUri({
        useProxy: true,
        scheme: "stream.data",
        path: REDIRECT_URI,
      });
      const RESPONSE_TYPE = "token";
      const SCOPE = encodeURI("openid user:read:email user:read:follows");
      const FORCE_VERIFY = true;
      const STATE = generateRandom(30);

      const authUrl =
        twitchEndpoints.authorization +
        `?client_id=${CLIENT_ID}` +
        `&redirect_uri=${REDIRECT}` +
        `&response_type=${RESPONSE_TYPE}` +
        `&scope=${SCOPE}` +
        `&force_verify=${FORCE_VERIFY}` +
        `&state=${STATE}`;

      const { type, params } = (await startAsync({
        authUrl,
      })) as AuthorizationResponse;

      if (type === "success" && params.error !== "access_denied") {
        if (params.state !== STATE) {
          throw new Error("Invalid state value");
        }
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${params.access_token}`;

        const { data } = await api.get("/users");
        const userInfo = await data.data[0];

        const userLogged = {
          id: userInfo.id,
          display_name: userInfo.display_name,
          email: userInfo.email,
          profile_image_url: userInfo.profile_image_url,
        };
        setUser(userLogged);
        setUserToken(params.access_token);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Aten????o! N??o foi poss??vel conectar a conta Twitch.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function signOut() {
    try {
      setIsLoggingOut(true);
      await revokeAsync(
        {
          clientId: CLIENT_ID,
          token: userToken,
        },
        {
          revocationEndpoint: twitchEndpoints.revocation,
        }
      );
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro SignOut",
        "Ocorreu um erro ao tentar se deslogar do app."
      );
    } finally {
      setUser({} as User);
      setUserToken("");
      delete api.defaults.headers.common["Authorization"];
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    api.defaults.headers["Client-Id"] = CLIENT_ID;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggingOut, isLoggingIn, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
