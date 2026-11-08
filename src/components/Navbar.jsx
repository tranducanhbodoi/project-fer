import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar, Container, Nav, Form, Button, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedBrand = searchParams.get('brand') || 'All';

  useEffect(() => {
    fetch('http://localhost:9999/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));

    fetch('http://localhost:9999/brands')
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((err) => console.error(err));
  }, []);

  const handleFilterChange = (type, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'All') {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    navigate(`/?${params.toString()}`);
  };

  const handleCartClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để xem giỏ hàng!');
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomeLink = () => {
    if (user?.role === 'manager') return '/manager/products';
    if (user?.role === 'admin') return '/admin/users';
    return '/';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to={getHomeLink()}>
          TechStore
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto align-items-center gap-2">
            {(!user || user.role === 'customer') && (
              <>
                <Nav.Link as={Link} to="/">
                  Trang chủ
                </Nav.Link>

                <Form.Select
                  size="sm"
                  style={{ width: '180px' }}
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="All">Danh mục: Tất cả</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Select
                  size="sm"
                  style={{ width: '160px' }}
                  value={selectedBrand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="All">Hãng: Tất cả</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </>
            )}

            {user?.role === 'manager' && (
              <>
                <Nav.Link as={Link} to="/manager/products">
                  Quản lý Sản phẩm
                </Nav.Link>
                <Nav.Link as={Link} to="/manager/orders">
                  Quản lý Đơn hàng
                </Nav.Link>
              </>
            )}

            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin/users">
                Quản lý Người dùng
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center gap-3">
            {(!user || user.role === 'customer') && (
              <>
                <Button variant="outline-light" size="sm" onClick={handleCartClick}>
                  Giỏ hàng <Badge bg="danger">{user ? totalItems : 0}</Badge>
                </Button>
                {user && (
                  <Nav.Link as={Link} to="/orders" className="text-light">
                    Lịch sử mua hàng
                  </Nav.Link>
                )}
              </>
            )}

            {user ? (
              <>
                <Navbar.Text className="text-light">
                  Xin chào, <strong>{user.name || user.username}</strong> ({user.role})
                </Navbar.Text>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button as={Link} to="/login" variant="primary" size="sm">
                Đăng nhập
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
