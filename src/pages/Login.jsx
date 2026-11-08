import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:9999/users');
      const users = await res.json();

      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!foundUser) {
        setError('Sai tên đăng nhập hoặc mật khẩu!');
        return;
      }

      login(foundUser);

      if (foundUser.role === 'manager') {
        navigate('/manager/products');
      } else if (foundUser.role === 'admin') {
        navigate('/admin/users');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Không thể kết nối đến json-server!');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={4}>
          <Card className="p-4">
            <h3 className="text-center mb-3">Đăng Nhập</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100">
                Đăng nhập
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
