import React from "react";
import { Card, Typography, Divider, Button } from "antd";
import {
  GithubOutlined,
  GlobalOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <Title level={2}>Blogon</Title>
        <Paragraph>
          Welcome to Blogon, a powerful and easy-to-use platform for creating
          your own personal blog. With a clean interface and a robust set of
          features, you can start sharing your thoughts with the world in just a
          few minutes.
        </Paragraph>

        <Divider />

        <Title level={3}>Create Your Own Blog</Title>
        <Paragraph>
          You can easily deploy your own version of this blog for free. Follow
          the setup guide in{" "}
          <a href="https://github.com/itsramin/blogon" target="_blank">
            here
          </a>
          .
        </Paragraph>
        <div className="flex justify-center">
          <Button type="primary" size="large" icon={<GlobalOutlined />}>
            <a href="https://github.com/itsramin/blogon" target="_blank">
              Blogon
            </a>
          </Button>
        </div>

        <Divider />

        <Title level={4}>A Note on the Typography</Title>
        <Paragraph>
          The font used in this project is{" "}
          <Text strong>Saber Rasti Kerdar (Vazirmatn)</Text>. We have chosen to
          use this font in memorial of him, honoring his legacy and
          contribution.
        </Paragraph>

        <Divider />

        <Title level={4}>Contact</Title>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:raminshakooei@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button icon={<MailOutlined />}>raminshakooei@gmail.com</Button>
          </a>
          <a
            href="https://github.com/itsramin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button icon={<GithubOutlined />}>github.com/itsramin</Button>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default About;
