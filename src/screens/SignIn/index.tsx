import React from 'react';
import { useTheme } from 'styled-components';
import { Fontisto } from '@expo/vector-icons'
import { ActivityIndicator, Alert, Modal, View } from 'react-native';

import { useAuth } from '../../hooks/useAuth';

import LoginBannerImg from '../../assets/images/login.svg';
import LogoImg from '../../assets/images/logo.svg';
import IconTwitch from "../../assets/images/twitch_icon.svg";

import {
  Container,
  Content,
  LoginBanner,
  LoginInfo,
  Header,
  Partner,
  Description,
  SignInButton,
  SignInButtonIcon,
  SignInButtonText,
} from "./styles";

export function SignIn() {
  const { signIn, isLoggingIn } = useAuth();
  const theme = useTheme();

  async function handleSignInWithTwitch() {
    try {
      return await signIn();
    } catch (error) {
      console.log(error);
      alert("Ocorreu um erro ao tentar logar no app");
    }
  }

  const signInButtonProps = {};

  return (
    <Container
      from={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
      }}
    >
      <Content>
        <LoginBanner>
          <LoginBannerImg width="100%" />
        </LoginBanner>

        <LoginInfo>
          <Header>
            <LogoImg />
            <Partner>by twitch</Partner>
          </Header>

          <Description>
            Veja dados{"\n"}
            interessantes sobre{"\n"}o mundo da Twitch
          </Description>

          <SignInButton onPress={handleSignInWithTwitch}>
            <SignInButtonIcon>
              {!isLoggingIn ? (
                // <IconTwitch />
                <Fontisto
                  name="twitch"
                  size={20}
                  color={theme.colors.white}
                  style={{ marginRight: 1 }}
                />
              ) : (
                <ActivityIndicator size={20} color={theme.colors.white} />
              )}
            </SignInButtonIcon>

            <SignInButtonText>
              {!isLoggingIn ? "Entrar com Twitch" : "Entrando..."}
            </SignInButtonText>
          </SignInButton>
        </LoginInfo>
      </Content>

      <Modal
        animationType="fade"
        visible={isLoggingIn}
        statusBarTranslucent
        transparent
      >
        <View style={{ flex: 1, backgroundColor: "rgba(14, 14, 16, 0.5)" }} />
      </Modal>
    </Container>
  );
}