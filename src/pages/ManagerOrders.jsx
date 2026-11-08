import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Form, Row, Col, Alert } from 'react-bootstrap';

const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = () => {
    fetch('http://localhost:9999/orders')
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải đơn hàng:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cập nhật trạng thái đơn hàng (Order status)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      // Nếu đơn chuyển sang "delivered" (Đã giao hàng) và thanh toán là COD thì tự động cập nhật paymentStatus thành "paid"
      const updatedFields = {
        status: newStatus,
      };
      if (newStatus === 'delivered' && order.paymentStatus === 'unpaid') {
        updatedFields.paymentStatus = 'paid';
      }

      const res = await fetch(`http://localhost:9999/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
    }
  };

  // Cập nhật trạng thái thanh toán (Payment status)
  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await fetch(`http://localhost:9999/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật thanh toán:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.status === statusFilter;
  });

  return (
    <Container className="mt-3 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Quản Lý Đơn Hàng</h3>
        <div style={{ width: '220px' }}>
          <Form.Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </Form.Select>
        </div>
      </div>

      {loading ? (
        <p>Đang tải danh sách đơn hàng...</p>
      ) : filteredOrders.length === 0 ? (
        <Alert variant="secondary">Không có đơn hàng nào.</Alert>
      ) : (
        <Table bordered hover responsive className="bg-white">
          <thead className="table-light">
            <tr>
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Sản Phẩm</th>
              <th>Tổng Tiền</th>
              <th>Thanh Toán</th>
              <th>Trạng Thái Đơn</th>
              <th>Ngày Đặt</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleString('vi-VN')
                : 'N/A';

              return (
                <tr key={order.id} className="align-middle">
                  <td>
                    <strong>#{order.id}</strong>
                  </td>
                  <td>
                    <div><strong>{order.customerName}</strong></div>
                    <small className="text-muted">{order.phone}</small>
                    <div className="small text-muted">{order.address}</div>
                  </td>
                  <td>
                    <ul className="list-unstyled mb-0 small">
                      {order.items &&
                        order.items.map((item, idx) => (
                          <li key={idx}>
                            • {item.name} x <strong>{item.quantity}</strong>
                          </li>
                        ))}
                    </ul>
                  </td>
                  <td className="text-danger fw-bold">
                    {Number(order.totalPrice).toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <div className="mb-1 small text-muted">
                      {order.paymentMethod || 'COD'}
                    </div>
                    <Form.Select
                      size="sm"
                      value={order.paymentStatus || 'unpaid'}
                      onChange={(e) =>
                        handleUpdatePaymentStatus(order.id, e.target.value)
                      }
                      style={{
                        fontSize: '12px',
                        color: order.paymentStatus === 'paid' ? '#198754' : '#dc3545',
                        fontWeight: 'bold',
                      }}
                    >
                      <option value="unpaid">Chưa thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={order.status || 'pending'}
                      onChange={(e) =>
                        handleUpdateStatus(order.id, e.target.value)
                      }
                      style={{ fontSize: '13px', fontWeight: 'bold' }}
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao hàng</option>
                      <option value="delivered">Đã giao hàng</option>
                      <option value="cancelled">Đã hủy</option>
                    </Form.Select>
                  </td>
                  <td className="small text-muted">{dateStr}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ManagerOrders;

