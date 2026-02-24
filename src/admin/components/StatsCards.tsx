import { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { FiActivity, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi';

interface StatsCardsProps {
  totalUsers: number;
  totalOrders: number;
  totalScrapKg: number;
  totalRevenue: number;
  hasRevenueData: boolean;
}

const formatCurrency = (value: number): string => `Rs.${value.toFixed(2)}`;

function StatsCards({
  totalUsers,
  totalOrders,
  totalScrapKg,
  totalRevenue,
  hasRevenueData,
}: StatsCardsProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 26;
    const timer = window.setInterval(() => {
      frame += 1;
      setProgress(Math.min(frame / totalFrames, 1));
      if (frame >= totalFrames) {
        window.clearInterval(timer);
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [totalUsers, totalOrders, totalScrapKg, totalRevenue, hasRevenueData]);

  const animated = useMemo(
    () => ({
      users: Math.round(totalUsers * progress),
      orders: Math.round(totalOrders * progress),
      scrap: (totalScrapKg * progress).toFixed(1),
      revenue: totalRevenue * progress,
    }),
    [progress, totalUsers, totalOrders, totalScrapKg, totalRevenue]
  );

  const stats = [
    {
      label: 'Total Users',
      value: String(animated.users),
      growth: '+12% this month',
      growthClass: 'positive',
      icon: FiUsers,
    },
    {
      label: 'Total Orders',
      value: String(animated.orders),
      growth: '+8% this month',
      growthClass: 'positive',
      icon: FiShoppingBag,
    },
    {
      label: 'Total Scrap Collected',
      value: `${animated.scrap} kg`,
      growth: '-5% this month',
      growthClass: 'negative',
      icon: FiActivity,
    },
    {
      label: 'Total Revenue',
      value: hasRevenueData ? formatCurrency(animated.revenue) : 'N/A',
      growth: hasRevenueData ? '+6% this month' : 'No revenue data',
      growthClass: hasRevenueData ? 'positive' : 'neutral',
      icon: FiDollarSign,
    },
  ];

  return (
    <section className="admin-stats-grid" aria-label="Platform stats">
      <Row className="g-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Col key={stat.label} xs={12} sm={6} xl={3}>
              <Card className="admin-stat-card h-100">
                <Card.Body>
                  <div className="admin-stat-top">
                    <p className="admin-stat-label">{stat.label}</p>
                    <span className="admin-stat-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                  </div>
                  <p className="admin-stat-value">{stat.value}</p>
                  <p className={`admin-stat-growth ${stat.growthClass}`}>{stat.growth}</p>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </section>
  );
}

export default StatsCards;
