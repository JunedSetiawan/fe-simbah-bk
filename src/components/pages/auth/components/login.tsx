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
import LogoImage from "@/public/logo/logo-smkn-jenangan.png";
// import { Title } from "@refinedev/antd";
import { Card, Input, Button, Form, theme } from "antd";
import Image from "next/image";
import {
  ArrowRightOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
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
  renderContent,
  title = undefined,
  mutationVariables,
}) => {
  const { useToken } = theme;
  const routerType = useRouterType();
  const Link = useLink();
  const [form] = Form.useForm();
  const { token } = useToken();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Monitor perubahan form
  const handleFormChange = (changedValues: any, allValues: any) => {
    setFormValues(allValues);
    setIsFormValid(!!allValues.username && !!allValues.password);
  };

  const translate = useTranslate();

  const authProvider = useActiveAuthProvider();
  const { mutate: login, isLoading } = useLogin<LoginFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const onFinish = (values: any) => {
    login({
      ...mutationVariables,
      username: values.username,
      password: values.password,
      remember: values.remember,
    });
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-14 w-14 relative">
            <Image src={LogoImage} alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">SIMBAH E-Konseling</h2>
            <p className="text-sm text-gray-600 mt-1">SMKN 1 JENANGAN</p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-medium">Masuk ke akun pengguna</h1>
          <p className="text-sm text-gray-600 mt-1">
            Jaga username dan password anda tetap aman
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-2"
          onValuesChange={handleFormChange}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              size="large"
              placeholder="Enter your username"
              className="rounded-md"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <div className="flex space-x-3">
              <Input.Password
                size="large"
                placeholder="Enter your password"
                className="rounded-md"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
                disabled={isLoading}
              />
              <Button
                className={`${isFormValid ? "bg-primary" : "bg-gray-300"}`}
                type="primary"
                htmlType="submit"
                size="large"
                icon={<ArrowRightOutlined />}
                loading={isLoading}
                disabled={!isFormValid || isLoading}
              />
            </div>
          </Form.Item>
        </Form>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            &copy;2025 SMKN 1 Jenangan Ponorogo by Jnd.
          </p>
        </div>
      </Card>
    </div>
  );

  return <div>{renderContent ? renderContent(content, title) : content}</div>;
};
