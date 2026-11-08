import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-4 pb-3 mt-auto">
      <Container>
        <Row className="gy-3">
          <Col md={4} sm={12}>
            <h5 className="text-white fw-bold">TechStore</h5>
            <p className="text-muted small">
              Hệ thống bán lẻ thiết bị công nghệ chính hãng: Điện thoại, Laptop, Máy tính bảng, Đồng hồ thông minh và Phụ kiện cao cấp.
            </p>
            <p className="text-muted small mb-0">
              Địa chỉ: 123 Đường Công Nghệ, Quận 1, TP. HCM<br />
              Hotline: 1800 1234 (Miễn phí)
            </p>
          </Col>

          <Col md={2} sm={6}>
            <h6 className="text-white fw-bold mb-3">Sản Phẩm</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-1"><Link to="/?category=Điện thoại" className="text-decoration-none text-muted">Điện thoại</Link></li>
              <li className="mb-1"><Link to="/?category=Laptop" className="text-decoration-none text-muted">Laptop</Link></li>
              <li className="mb-1"><Link to="/?category=Máy tính bảng" className="text-decoration-none text-muted">Máy tính bảng</Link></li>
              <li className="mb-1"><Link to="/?category=Đồng hồ thông minh" className="text-decoration-none text-muted">Đồng hồ</Link></li>
              <li className="mb-1"><Link to="/?category=Phụ kiện" className="text-decoration-none text-muted">Phụ kiện</Link></li>
            </ul>
          </Col>

          <Col md={3} sm={6}>
            <h6 className="text-white fw-bold mb-3">Chính Sách & Hỗ Trợ</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-1">Chính sách bảo hành 12 - 24 tháng</li>
              <li className="mb-1">Chính sách đổi trả trong 30 ngày</li>
              <li className="mb-1">Giao hàng và thanh toán tận nơi</li>
              <li className="mb-1">Hướng dẫn mua hàng online</li>
            </ul>
          </Col>

          <Col md={3} sm={12}>
            <h6 className="text-white fw-bold mb-3">Tổng Đài Hỗ Trợ</h6>
            <p className="small text-muted mb-1">
              Tư vấn mua hàng: <strong className="text-white">1800 1234</strong> (8:00 - 22:00)
            </p>
            <p className="small text-muted mb-1">
              Bảo hành, khiếu nại: <strong className="text-white">1800 5678</strong> (8:00 - 21:00)
            </p>
            <p className="small text-muted mb-0">
              Email: <span className="text-white">support@techstore.vn</span>
            </p>
          </Col>
        </Row>

        <hr className="my-3 border-secondary" />

        <div className="text-center text-muted small">
          © {new Date().getFullYear()} TechStore. Tất cả các quyền được bảo lưu.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

