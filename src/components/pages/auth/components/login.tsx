import React, { useState } from "react";
import {
  useActiveAuthProvider,
  useLink,
  useLogin,
  useRouterContext,
  useRouterType,
  useTranslate,
  // LoginFormTypes,
  LoginPageProps,
} from "@refinedev/core";
import { LoginFormTypes } from "./types";

type DivPropsType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
type FormPropsType = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;

type LoginProps = LoginPageProps<DivPropsType, DivPropsType, FormPropsType>;

export const LoginPage: React.FC<LoginProps> = ({
  providers,
  registerLink,
  forgotPasswordLink,
  rememberMe,
  contentProps,
  wrapperProps,
  renderContent,
  formProps,
  title = undefined,
  hideForm,
  mutationVariables,
}) => {
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const translate = useTranslate();

  // interface LoginFormTypes {
  //   username?: string;
  //   password?: string;
  //   remember?: boolean;
  //   providerName?: string;
  //   redirectPath?: string;
  // }

  const authProvider = useActiveAuthProvider();
  const { mutate: login } = useLogin<LoginFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const renderLink = (link: string, text?: string) => {
    return <ActiveLink to={link}>{text}</ActiveLink>;
  };

  const renderProviders = () => {
    if (providers) {
      return providers.map((provider) => (
        <div
          key={provider.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={() =>
              login({
                ...mutationVariables,
                providerName: provider.name,
              })
            }
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {provider?.icon}
            {provider.label ?? <label>{provider.label}</label>}
          </button>
        </div>
      ));
    }
    return null;
  };

  const content = (
    <div {...contentProps}>
      <h1 style={{ textAlign: "center" }}>
        {translate("pages.login.title", "Sign in to your account")}
      </h1>
      {renderProviders()}
      {!hideForm && (
        <>
          <hr />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login({ ...mutationVariables, username, password, remember });
            }}
            {...formProps}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 25,
              }}
            >
              <label htmlFor="username-input">
                {translate("pages.login.fields.username", "Username")}
              </label>
              <input
                id="username-input"
                name="username"
                type="text"
                size={20}
                autoCorrect="off"
                spellCheck={false}
                autoCapitalize="off"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="password-input">
                {translate("pages.login.fields.password", "Password")}
              </label>
              <input
                id="password-input"
                type="password"
                name="password"
                required
                size={20}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {rememberMe ?? (
                <>
                  <label htmlFor="remember-me-input">
                    {translate("pages.login.buttons.rememberMe", "Remember me")}
                    <input
                      id="remember-me-input"
                      name="remember"
                      type="checkbox"
                      size={20}
                      checked={remember}
                      value={remember.toString()}
                      onChange={() => {
                        setRemember(!remember);
                      }}
                    />
                  </label>
                </>
              )}
              <br />
              {forgotPasswordLink ??
                renderLink(
                  "/forgot-password",
                  translate(
                    "pages.login.buttons.forgotPassword",
                    "Forgot password?"
                  )
                )}
              <input
                type="submit"
                value={translate("pages.login.signin", "Sign in")}
              />
            </div>
          </form>
        </>
      )}
    </div>
  );

  return <div>{renderContent ? renderContent(content, title) : content}</div>;
};
