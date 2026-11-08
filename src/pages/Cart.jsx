import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Table,
  Button,
  Card,
  Form,
  Row,
  Col,
  Alert,
  Modal,
} from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' hoặc 'online'

  // Modal giả lập thanh toán online
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Tạo đơn hàng lưu vào json-server
  const submitOrder = async (isPaid = false) => {
    const newOrder = {
      userId: user.id,
      customerName: user.name || user.username,
      phone,
      address,
      items: cart,
      totalPrice,
      paymentMethod: paymentMethod === 'online' ? 'Chuyển khoản Online' : 'Thanh toán khi nhận hàng (COD)',
      paymentStatus: isPaid ? 'paid' : 'unpaid', // 'paid': Đã thanh toán, 'unpaid': Chưa thanh toán
      status: 'pending', // 'pending': Chờ xác nhận, 'confirmed': Đã xác nhận, 'shipping': Đang giao, 'delivered': Đã giao hàng, 'cancelled': Đã hủy
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('http://localhost:9999/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        clearCart();
        alert(
          isPaid
            ? 'Thanh toán Online thành công! Đơn hàng của bạn đang được xử lý.'
            : 'Đặt hàng thành công! Đơn hàng đang ở trạng thái Chờ xác nhận.'
        );
        navigate('/orders');
      } else {
        alert('Có lỗi xảy ra khi tạo đơn hàng!');
      }
    } catch (error) {
      console.error('Lỗi khi lưu đơn hàng:', error);
      alert('Không thể kết nối tới server!');
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    if (paymentMethod === 'online') {
      // Mở modal giả lập thanh toán online
      setShowOnlineModal(true);
    } else {
      // COD thanh toán khi nhận hàng
      submitOrder(false);
    }
  };

  // Xác nhận chuyển khoản trong modal online
  const handleConfirmOnlinePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowOnlineModal(false);
      submitOrder(true);
    }, 1500);
  };

  return (
    <Container className="mt-3 mb-4">
      <h3 className="mb-3">Giỏ Hàng</h3>

      {cart.length === 0 ? (
        <Alert variant="secondary">
          <p className="mb-2">Giỏ hàng đang trống.</p>
          <Button as={Link} to="/" variant="primary" size="sm">
            Tiếp tục mua sắm
          </Button>
        </Alert>
      ) : (
        <>
          <Table bordered hover responsive className="bg-white">
            <thead className="table-light">
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="align-middle">
                  <td>{item.name}</td>
                  <td>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      -
                    </Button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </Button>
                  </td>
                  <td className="text-danger fw-bold">
                    {(Number(item.price) * item.quantity).toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Card className="p-3">
            <h4 className="text-danger mb-3">
              Tổng tiền: {totalPrice.toLocaleString('vi-VN')} đ
            </h4>

            <Form onSubmit={handleCheckoutSubmit}>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Label className="fw-bold small">Số điện thoại nhận hàng (*)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-bold small">Địa chỉ giao hàng (*)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </Col>
              </Row>

              {/* CHỌN PHƯƠNG THỨC THANH TOÁN */}
              <div className="mb-3 p-3 border rounded bg-light">
                <Form.Label className="fw-bold mb-2">Phương thức thanh toán:</Form.Label>
                <div className="d-flex flex-column gap-2">
                  <Form.Check
                    type="radio"
                    id="payment-cod"
                    name="paymentMethod"
                    label="Thanh toán khi nhận hàng (COD) - Trả tiền mặt cho shipper"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <Form.Check
                    type="radio"
                    id="payment-online"
                    name="paymentMethod"
                    label="Thanh toán Online (Giả lập quét mã QR / Chuyển khoản ngân hàng)"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                </div>
              </div>

              <Button type="submit" variant="success" size="lg">
                {paymentMethod === 'online' ? 'Tiếp tục thanh toán Online' : 'Xác nhận Đặt Hàng (COD)'}
              </Button>
            </Form>
          </Card>
        </>
      )}

      {/* MODAL GIẢ LẬP THANH TOÁN ONLINE */}
      <Modal show={showOnlineModal} onHide={() => !isProcessingPayment && setShowOnlineModal(false)} centered>
        <Modal.Header closeButton={!isProcessingPayment}>
          <Modal.Title className="h5">Cổng Thanh Toán Online (Giả lập)</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p className="text-muted mb-2">Quét mã QR qua ứng dụng Ngân hàng để thanh toán:</p>
          
          <div className="d-inline-block p-2 border rounded bg-white shadow-sm mb-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TECHSTORE_ORDER_${totalPrice}`}
              alt="Mã QR thanh toán"
              style={{ width: '180px', height: '180px' }}
            />
          </div>

          <div className="text-start bg-light p-3 rounded small mb-3">
            <p className="mb-1"><strong>Ngân hàng:</strong> Vietcombank (VCB)</p>
            <p className="mb-1"><strong>Số tài khoản:</strong> 9999 8888 7777</p>
            <p className="mb-1"><strong>Chủ tài khoản:</strong> CÔNG TY CÔNG NGHỆ TECHSTORE</p>
            <p className="mb-0">
              <strong>Số tiền:</strong>{' '}
              <span className="text-danger fw-bold">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </p>
          </div>

          {isProcessingPayment && (
            <Alert variant="info" className="py-2 small mb-0">
              Đang xác thực giao dịch chuyển khoản... Vui lòng đợi trong giây lát!
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            disabled={isProcessingPayment}
            onClick={() => setShowOnlineModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isProcessingPayment}
            onClick={handleConfirmOnlinePayment}
          >
            {isProcessingPayment ? 'Đang xử lý...' : 'Tôi đã chuyển khoản thành công'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Cart;
