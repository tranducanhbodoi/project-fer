import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';

const initialUserForm = {
  username: '',
  password: '',
  name: '',
  role: 'customer',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialUserForm);
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:9999/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Lỗi tải danh sách user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await fetch(`http://localhost:9999/users/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingId }),
        });
        alert('Cập nhật người dùng thành công!');
      } else {
        await fetch('http://localhost:9999/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        alert('Thêm người dùng mới thành công!');
      }

      setFormData(initialUserForm);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi lưu người dùng:', err);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setFormData({
      username: u.username || '',
      password: u.password || '',
      name: u.name || '',
      role: u.role || 'customer',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      await fetch(`http://localhost:9999/users/${id}`, {
        method: 'DELETE',
      });
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi xóa người dùng:', err);
    }
  };

  return (
    <Container className="mt-3 mb-4">
      <h3 className="mb-3">Quản Lý Người Dùng</h3>

      <Card className="p-3 mb-4">
        <h5 className="mb-3">
          {editingId ? `Sửa thông tin User ID: ${editingId}` : 'Thêm User mới'}
        </h5>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={3}>
              <Form.Control
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                name="name"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={3}>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">customer</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </Form.Select>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" variant="primary">
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData(initialUserForm);
                }}
              >
                Hủy
              </Button>
            )}
          </div>
        </Form>
      </Card>

      <Table bordered hover responsive className="bg-white">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Họ tên</th>
            <th>Mật khẩu</th>
            <th>Role</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="align-middle">
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.name}</td>
              <td>{u.password}</td>
              <td>
                <Badge bg="secondary">{u.role}</Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(u)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(u.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminUsers;
