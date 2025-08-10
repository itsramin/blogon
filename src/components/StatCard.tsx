import { Card, Statistic } from "antd";

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card className="shadow-sm">
    <Statistic
      title={title}
      value={value}
      prefix={<div className={`text-${color}-600`}>{icon}</div>}
      valueStyle={{ color: `var(--ant-color-${color}-6)` }}
    />
  </Card>
);

export default StatCard;
