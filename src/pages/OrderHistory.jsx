import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:9999/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải lịch sử đơn hàng:', err);
        setLoading(false);
      });
  }, [user]);

  // Helper hiển thị huy hiệu trạng thái đơn hàng
  const renderOrderStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge bg="primary">Đã xác nhận</Badge>;
      case 'shipping':
        return <Badge bg="info" text="dark">Đang giao hàng</Badge>;
      case 'delivered':
        return <Badge bg="success">Đã giao hàng thành công</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Đã hủy</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 mb-4">
        <p>Đang tải lịch sử đơn hàng...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-3 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Lịch Sử Mua Hàng</h3>
        <Button as={Link} to="/" variant="secondary" size="sm">
          Tiếp tục mua sắm
        </Button>
      </div>

      {orders.length === 0 ? (
        <Alert variant="secondary">
          <p className="mb-2">Bạn chưa có đơn đặt hàng nào.</p>
          <Button as={Link} to="/" variant="primary" size="sm">
            Khám phá sản phẩm ngay
          </Button>
        </Alert>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => {
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleString('vi-VN')
              : 'N/A';

            return (
              <Card key={order.id} className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <strong>Mã đơn hàng: #{order.id}</strong>
                    <span className="text-muted ms-3 small">Ngày đặt: {dateStr}</span>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    {/* Trạng thái thanh toán */}
                    {order.paymentStatus === 'paid' ? (
                      <Badge bg="success">Đã thanh toán ({order.paymentMethod || 'Online'})</Badge>
                    ) : (
                      <Badge bg="secondary">Chưa thanh toán ({order.paymentMethod || 'COD'})</Badge>
                    )}
                    {/* Trạng thái đơn hàng */}
                    {renderOrderStatusBadge(order.status)}
                  </div>
                </Card.Header>

                <Card.Body>
                  <div className="mb-2 small">
                    <p className="mb-1">
                      <strong>Người nhận:</strong> {order.customerName} |{' '}
                      <strong>SĐT:</strong> {order.phone}
                    </p>
                    <p className="mb-2">
                      <strong>Địa chỉ giao:</strong> {order.address}
                    </p>
                  </div>

                  <Table bordered hover responsive size="sm" className="mb-2 bg-white">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '45%' }}>Sản phẩm</th>
                        <th style={{ width: '20%' }}>Đơn giá</th>
                        <th style={{ width: '15%' }} className="text-center">Số lượng</th>
                        <th style={{ width: '20%' }} className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items &&
                        order.items.map((item, idx) => (
                          <tr key={idx} className="align-middle">
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      objectFit: 'cover',
                                    }}
                                    className="rounded border"
                                  />
                                )}
                                <Link
                                  to={`/product/${item.id}`}
                                  className="text-decoration-none text-dark fw-bold"
                                >
                                  {item.name}
                                </Link>
                              </div>
                            </td>
                            <td>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end fw-bold text-danger">
                              {(Number(item.price) * item.quantity).toLocaleString(
                                'vi-VN'
                              )}{' '}
                              đ
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {order.status === 'delivered' ? (
                        <span className="text-success small fw-bold">
                          Đơn hàng đã hoàn tất! Bạn có thể vào từng sản phẩm để đánh giá.
                        </span>
                      ) : order.status === 'cancelled' ? (
                        <span className="text-danger small">Đơn hàng này đã bị hủy.</span>
                      ) : (
                        <span className="text-muted small">
                          Đơn hàng đang trong quá trình xử lý và vận chuyển.
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="fs-6 me-2">Tổng thanh toán:</span>
                      <strong className="text-danger fs-5">
                        {Number(order.totalPrice).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default OrderHistory;
